'use strict';

const Promise = require('bluebird');
const performanceNow = require('performance-now');
const sinon = require('sinon');
const fs = require('fs');

const codeProfilerResult = {};
let spreadStub;
let thenStub;

const startProfiling = function startProfiling () {

	spreadStub = sinon.stub(Promise.prototype, 'spread').callsFake(function spreadProfiler () {

		const promiseIndex = spreadStub.callCount - 1;
		const functionName = spreadStub.getCall(promiseIndex).args[0].name;

		const startTime = performanceNow();
		return this.all()._then((result) => {
			CodeProfiler.codeProfilerResult[functionName] = performanceNow() - startTime;
			return spreadStub.getCall(promiseIndex).args[0](...result);
		});

	});

	thenStub = sinon.stub(Promise.prototype, 'then').callsFake(function thenProfiler () {

		const promiseIndex = thenStub.callCount - 1;
		const functionName = thenStub.getCall(promiseIndex).args[0].name;

		const startTime = performanceNow();
		return this._then((result) => {
			CodeProfiler.codeProfilerResult[functionName] = performanceNow() - startTime;
			return thenStub.getCall(promiseIndex).args[0](result);
		});

	});

};

const stopProfiling = function stopProfiling () {

	spreadStub.restore();
	thenStub.restore();

};

const writeCodeProfilerResultToFile = function writeCodeProfilerResultToFile (path = './results/output.json') {

	fs.writeFile(path, JSON.stringify(CodeProfiler.codeProfilerResult, null, 4), 'utf8', function fileWriter (error) {
		if (error) {
			throw error;
		}
	});

};

const resetCodeProfilerResult = function resetCodeProfilerResult () {
	CodeProfiler.codeProfilerResult = {};
};

const CodeProfiler = {
	startProfiling: startProfiling,
	stopProfiling: stopProfiling,
	writeCodeProfilerResultToFile: writeCodeProfilerResultToFile,
	resetCodeProfilerResult: resetCodeProfilerResult,
	codeProfilerResult: codeProfilerResult
};

module.exports = CodeProfiler;