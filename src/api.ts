import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://developer.mozilla.org/api/v1',
});
