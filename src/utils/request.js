import axios, { CancelToken } from 'axios';
import { CANCEL } from 'redux-saga';

const queryParamsToQueryString = function(params) {
  const keys = Object.keys(params);
  if (!keys.length) return '';
  return '?' + keys.map(key => key + '=' + params[key]).join('&');
};

function checkStatus(response) {
  if (
    response.status >= 200
    && response.status < 300
    && response.data
    && response.data.status !== 'FAIL'
  ) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function extractData({ status, data }) {
  if (status === 204 || status === 205) {
    return null;
  }
  return data;
}

function request(url, options = {}) {
  const requestUrl = url;
  const source = CancelToken.source();
  options.data = queryParamsToQueryString(options.data);

  const axiosRequest = axios(requestUrl, {
    ...options,
    cancelToken: source.token,
    validateStatus: () => true,
  })
    .then(checkStatus)
    .then(extractData);

  axiosRequest[CANCEL] = () => source.cancel();
  return axiosRequest;
}

function postRequest(url, options = {}) {
  return request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    data: JSON.stringify(),
  });
}

export default request;

export { postRequest, request };
