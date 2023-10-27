"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetLoader = void 0;
class AssetLoader extends EventTarget {
    constructor(options) {
        super();
        this.fileTotal = 0;
        this.fileCount = 0;
        this.headerCount = 0;
        this.downloadTotal = 0;
        this.progressArray = [];
        this.blobArray = [];
        const { requestLogFunction, errorFunction, progressFunction, completeLogFunction } = options;
        this.requestLogFunction = requestLogFunction;
        this.errorFunction = errorFunction;
        this.progressFunction = progressFunction;
        this.completeLogFunction = completeLogFunction;
    }
    loadArray(urlArray) {
        this.fileTotal = urlArray.length;
        this.fileCount = 0;
        this.headerCount = 0;
        this.areHeadersCounted = false;
        this.downloadTotal = 0;
        for (let i = 0; i < this.fileTotal; i++) {
            const url = urlArray[i];
            if (this.requestLogFunction)
                this.requestLogFunction(url);
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onreadystatechange = (evt) => this.sumContentLength(xhr);
            xhr.onerror = () => this.onError(url);
            xhr.onprogress = (evt) => this.calcProgress(i, evt);
            xhr.onload = () => this.onLoad(xhr, i, url);
            xhr.send();
        }
    }
    sumContentLength(xhr) {
        if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            this.headerCount++;
            if (this.headerCount === this.fileTotal)
                this.areHeadersCounted = true;
            const contentLength = xhr.getResponseHeader('Content-Length');
            if (contentLength !== null)
                this.downloadTotal += parseInt(contentLength, 10);
            else
                console.log('Content-Length header not found in response.');
        }
    }
    onError(url) {
        if (this.errorFunction)
            this.errorFunction(url);
    }
    calcProgress(i, evt) {
        if (this.progressFunction) {
            this.progressArray[i] = evt.loaded;
            if (this.areHeadersCounted) {
                const totalProgress = this.progressArray.reduce((total, loaded) => total + loaded, 0);
                const progress = (totalProgress / this.downloadTotal) * 100;
                this.progressFunction(progress);
            }
        }
    }
    onLoad(xhr, i, url) {
        if (xhr.status === 200) {
            this.fileCount++;
            const blob = xhr.response;
            this.blobArray[i] = blob;
            if (this.completeLogFunction)
                this.completeLogFunction(i);
            if (this.fileCount === this.fileTotal)
                this.dispatchEvent(new Event(AssetLoader.COMPLETE));
        }
        else
            this.onError(url);
    }
    dispose() {
        this.blobArray.length = this.progressArray.length = 0;
    }
}
exports.AssetLoader = AssetLoader;
AssetLoader.COMPLETE = 'complete';
