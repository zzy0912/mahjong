/**
 * Created by MyPC on 2017/6/12.
 */

import objectUtil from '../util/objectUtil';
import dateUtil from '../util/dateUtil';
import uiService from './uiService';
import mockService from './mockService';
import globalProperties from './globalProperties';

import Vue from 'vue';
import VueResource from 'vue-resource';
import VueCookie from 'vue-cookie';

Vue.use(VueResource);
Vue.use(VueCookie);

window.remoteServiceShowLog = false;

const LOG_INDENT = 2;
let _inDevelopment = (process.env.NODE_ENV !== 'production');
let _callSn = 0;
let _callMap = { };

function _logCall(service, method, para) {
    if (_inDevelopment || window.remoteServiceShowLog) {
        let call_time = new Date().valueOf();
        _callSn++;
        _callMap[_callSn] = call_time;
        let str = '%c' + _callSn + '#call[' + call_time + ']: ' + service + '/' + method + '/' + JSON.stringify(para, null, LOG_INDENT);
        console.log(str, 'color: blue');
        return _callSn;
    } else {
        return 0;
    }
}

function _logBatchCall(calls) {
    if (_inDevelopment || window.remoteServiceShowLog) {
        let call_time = new Date().valueOf();
        _callSn++;
        _callMap[_callSn] = call_time;
        let str = '%c' + _callSn + '#batch call[' + call_time + ']:';
        for (let i = 0; i < calls.length; i++) {
            let call = calls[i];
            str += '\r\n' + i + ': ' + call.service + '/' + call.method + '/' + JSON.stringify(call.para, null, LOG_INDENT);
        }
        console.log(str, 'color: blue');
        return _callSn;
    } else {
        return 0;
    }
}

function _showErrorMessage(failInfo, err, showServerErrorMsg) {
    if (!err) {
        return;
    }
    let show_err_msg;
    if (showServerErrorMsg) {
        show_err_msg = failInfo ? (failInfo + ': ' + err) : err;
    } else {
        show_err_msg = failInfo;
    }
    uiService.showAlert(show_err_msg, 'error');
}

function _handleCallError(reject, isBatchCall, callSn, response, failInfo, showServerErrorMsg) {
    // 判断是否登录，如果未登录，转入登录页面
    if (response.status === 401) {
        window.location = '/#/login#redirect=' + encodeURIComponent(window.location);
    } else {
        let err = _getCallResponseError(response);
        if (_inDevelopment || window.remoteServiceShowLog) {
            let call_time = new Date().valueOf();
            let str = '%c' + callSn + '#' + (isBatchCall ? 'batch call' : 'call') + '[' + call_time + '/' +
                (call_time - _callMap[callSn]) + ']: ' + err;
            console.log(str, 'color: red');
            delete _callMap[callSn];
        }

        reject(err);
        _showErrorMessage(failInfo, err, showServerErrorMsg);
    }
}

function _handleCallResult(resolve, reject, callSn, responseResult, isMock, failInfo, showServerErrorMsg) {
    let err = _getCallExceptionError(responseResult);
    let result;
    if (!err) {
        result = dateUtil.parseDateInJson(responseResult);
    }
    if (_inDevelopment || window.remoteServiceShowLog) {
        let call_time = new Date().valueOf();
        let str = '%c' + callSn + '#call[' + call_time + '|' +
            (call_time - _callMap[callSn]) + ']';
        if (isMock) {
            str += '[mock]';
        }
        str += ': ';
        if (err) {
            str += err;
            console.log(str, 'color: red');
        } else {
            str += JSON.stringify(result, null, LOG_INDENT);
            console.log(str, 'color: green');
        }
        delete _callMap[callSn];
    }
    if (err) {
        reject(err);
    } else {
        resolve(result);
    }
    _showErrorMessage(failInfo, err, showServerErrorMsg);
}

function _handleBatchCallResult(resolve, callSn, responseResults, mockCallIndexes, failInfo, showServerErrorMsg) {
    let results = dateUtil.parseDateInJson(responseResults);
    let total_err = '';
    if (_inDevelopment || window.remoteServiceShowLog) {
        let call_time = new Date().valueOf();
        let str = '%c' + callSn + '#batch call[' + call_time + '/' +
            (call_time - _callMap[callSn]) + ']:';
        for (let i = 0; i < results.length; i++) {
            let result = results[i];
            str += '\r\n' + i;
            if (mockCallIndexes && mockCallIndexes.indexOf(i) >= 0) {
                str += '[mock]';
            }
            str += ': ';
            let err = _getCallExceptionError(result);
            if (err) {
                str += err;
                total_err += '\r\n' + err;
            } else {
                str += JSON.stringify(results[i], null, LOG_INDENT);
            }
        }
        console.log(str, 'color: green');
        delete _callMap[callSn];
    }
    resolve(results);
    _showErrorMessage(failInfo, total_err, showServerErrorMsg);
}

function _getCallResponseError(response) {
    let err = _getCallExceptionError(response.data);
    if (err) {
        return err;
    } else {
        return response.statusText ? response.statusText : ('error(' + response.status + ')');
    }
}

function _getCallExceptionError(result) {
    if (objectUtil.isObject(result) && result.__exception) {
        return result.__exception.message ? result.__exception.message : ('error(' + result.__exception.code + ')');
    } else {
        return null;
    }
}

function _getCallHeaders(headers) {
    let call_headers = Object.assign({}, globalProperties.get('callHeaders'));
    Object.assign(call_headers, headers);
    if (!call_headers.token) {
        call_headers.token = Vue.cookie.get('token');
    }
    return call_headers;
}

export default {
    setHeaders(headers) {
        let old_headers = globalProperties.get('callHeaders');
        if (old_headers) {
            Object.assign(old_headers, headers);
        } else {
            globalProperties.set('callHeaders', headers);
        }
    },
    call: function(service, method, para, failInfo, showServerErrorMsg, headers) {
        // 显示调用
		showServerErrorMsg = true;
        let call_sn = _logCall(service, method, para);
        // 如果para不是一个对象，无法json化，所以构造一个对象传递。
        para = objectUtil.isObject(para) ? para : { __para: para };

        let promise = new Promise(function(resolve, reject) {
            // 如果是使能了mockService，调用mockService获取返回值
            if (_inDevelopment && mockService) {
                let result = mockService.call(service, method, para);
                if (result !== undefined) {
                    _handleCallResult(resolve, reject, call_sn, result, true, failInfo, showServerErrorMsg);
                    return;
                }
            }
            Vue.http.post('/rest/' + service + '/' + method, JSON.stringify(para), { headers: _getCallHeaders(headers) }).then(response => {
                _handleCallResult(resolve, reject, call_sn, response.data, false, failInfo, showServerErrorMsg);
            }, response => {
                _handleCallError(reject, false, call_sn, response, failInfo, showServerErrorMsg);
            });
        });
        return promise;
    },

    batchCall: function(calls, failInfo, transaction, showServerErrorMsg, headers) {
		showServerErrorMsg = true;
        // 显示调用
        let call_sn = _logBatchCall(calls);

        let promise = new Promise(function(resolve, reject) {
            // 如果是使能了mockService，调用mockService获取返回值
            let send_calls, results, mock_call_indexes;
            if (_inDevelopment && mockService) {
                results = mockService.batchCall(calls);
                // 检查哪些调用已经返回了值，哪些还没有，然后构造新的调用
                send_calls = [ ];
                mock_call_indexes = [ ];
                for (let i = 0; i < results.length; i++) {
                    if (results[i] === undefined) {
                        send_calls.push(calls[i]);
                    } else {
                        mock_call_indexes.push(i);
                    }
                }
                if (send_calls.length === 0) {
                    _handleBatchCallResult(resolve, call_sn, results, mock_call_indexes, failInfo, showServerErrorMsg);
                    return;
                }
            } else {
                send_calls = calls;
            }

            // 构造参数
            let para = { calls: calls };
            if (transaction === true) {
                para.transaction = true;
            }
            Vue.http.post('/rest/batch/call', JSON.stringify(para), { headers: _getCallHeaders(headers) }).then(function(response) {
                if (results) {
                    // 合并mockService返回的结果和后台返回的结果
                    let j = 0;
                    for (let i = 0; i < results.length; i++) {
                        if (results[i] === undefined) {
                            results[i] = response.data[j];
                            j++;
                        }
                    }
                } else {
                    results = response.data;
                }
                _handleBatchCallResult(resolve, call_sn, results, mock_call_indexes, failInfo, showServerErrorMsg);
            }, function(response) {
                _handleCallError(reject, true, call_sn, response, failInfo, showServerErrorMsg);
            });
        });
        return promise;
    },

    createPara: function() {
        if (arguments.length > 0) {
            let para = { };
            for (let i = 0; i < arguments.length; i += 2) {
                para[arguments[i]] = arguments[i + 1];
            }
            return para;
        } else {
            return null;
        }
    },

    createCall: function() {
        let call = { };
        call.service = arguments[0];
        call.method = arguments[1];
        if (arguments.length > 2) {
            let para = { };
            call.para = para;
            for (let i = 2; i < arguments.length; i += 2) {
                para[arguments[i]] = arguments[i + 1];
            }
        }
        return call;
    },

    getCallExceptionError: function(result) {
        if (objectUtil.isArray(result)) {
            let err_info = '';
            for (let i = 0; i < result.length; i++) {
                let err = _getCallExceptionError(result[i]);
                if (err) {
                    if (err_info) {
                        err_info += '\r\n' + err;
                    } else {
                        err_info = err;
                    }
                }
            }
            return err_info;
        } else {
            return _getCallExceptionError(result);
        }
    },

    logout: function() {
        Vue.cookie.set('token', null, { path: '/', expires: 0 });
        // 跳转到登录页面
        window.location = '/#/login';
    },

    getLoginUser: function(retFields) {
        let promise = new Promise(function(resolve, reject) {
            // 如果是使能了mockService，调用mockService获取返回值
            Vue.http.post('/rest/model/getEntity', JSON.stringify({
                target: 'user',
                filter: {
                    field: 'account',
                    match: 'EQ',
                    value: Vue.cookie.get('account')
                },
                retFields: retFields || ['account']
            }), { headers: { token: Vue.cookie.get('token') } }).then(response => {
                let result = dateUtil.parseDateInJson(response.data);
                resolve(result);
            }, response => {
                _handleCallError(reject, false, -1, response);
            });
        });
        return promise;
    }
};
