export class AssetLoader extends EventTarget {
    static COMPLETE: string = 'complete';

    private requestLogFunction: ((url: string) => void) | undefined;
    private errorFunction: ((url: string) => void) | undefined;
    private progressFunction: ((progress: number) => void) | undefined;
    private completeLogFunction: ((index: number) => void) | undefined;
    private fileTotal: number = 0;
    private fileCount: number = 0;
    private headerCount: number = 0;
    private areHeadersCounted: boolean | undefined;
    private downloadTotal: number = 0;
    private progressArray: number[] = [];
    private blobArray: Blob[] = [];
    constructor(options: {
        requestLogFunction?: (url: string) => void,
        errorFunction?: (url: string) => void,
        progressFunction?: (progress: number) => void,
        completeLogFunction?: (index: number) => void,
    }) {
        super();
        const {
            requestLogFunction,
            errorFunction,
            progressFunction,
            completeLogFunction
        } = options;
        this.requestLogFunction = requestLogFunction;
        this.errorFunction = errorFunction;
        this.progressFunction = progressFunction;
        this.completeLogFunction = completeLogFunction;
    }

    loadArray(urlArray: string[]) {
        this.fileTotal = urlArray.length;
        this.fileCount = 0;
        this.headerCount = 0;
        this.areHeadersCounted = false;
        this.downloadTotal = 0;
        for (let i = 0; i < this.fileTotal; i++) {
            const url: string = urlArray[i];
            if (this.requestLogFunction) this.requestLogFunction(url);

            const xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onreadystatechange = (evt: Event) => this.sumContentLength(xhr);
            xhr.onerror = () => this.onError(url);
            xhr.onprogress = (evt: ProgressEvent) => this.calcProgress(i, evt);
            xhr.onload = () => this.onLoad(xhr, i, url);
            xhr.send();
        }
    }

    sumContentLength(xhr: XMLHttpRequest) {
        if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            this.headerCount++;
            if (this.headerCount === this.fileTotal) this.areHeadersCounted = true;
            const contentLength: string | null = xhr.getResponseHeader('Content-Length');
            if (contentLength !== null) this.downloadTotal += parseInt(contentLength, 10);
            else console.log('Content-Length header not found in response.');
        }
    }

    onError(url: string) {
        if (this.errorFunction) this.errorFunction(url);
    }

    calcProgress(i: number, evt: ProgressEvent) {
        if (this.progressFunction) {
            this.progressArray[i] = evt.loaded;
            if (this.areHeadersCounted) {
                const totalProgress = this.progressArray.reduce((total, loaded) => total + loaded, 0);
                const progress = (totalProgress / this.downloadTotal) * 100;
                this.progressFunction(progress);
            }
        }
    }

    onLoad(xhr: XMLHttpRequest, i: number, url: string) {
        if (xhr.status === 200) {
            this.fileCount++;
            const blob = xhr.response as Blob;
            this.blobArray[i] = blob;
            if (this.completeLogFunction) this.completeLogFunction(i);            
            if (this.fileCount === this.fileTotal) this.dispatchEvent(new Event(AssetLoader.COMPLETE));
        } else this.onError(url);
    }

    dispose() {
        this.blobArray.length = this.progressArray.length = 0;
    }
}
