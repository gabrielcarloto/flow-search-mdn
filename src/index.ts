import open from 'open';
import axios from 'axios';
import { Flow, JSONRPCResponse } from 'flow-launcher-helper';
import { api } from './api.js';

interface GetMDNPagesResponse {
  data: {
    documents: {
      mdn_url: string;
      title: string;
      summary: string;
    }[];
  };
}

type Methods = 'open_result';

interface Settings {
  sort: string;
  locale: string;
}

const { params, showResult, on, run, settings } = new Flow<Methods, Settings>(
  'app.png',
);

on('query', async () => {
  if (params.length <= 1) {
    return showResult({
      title: 'Waiting for query...',
    });
  }

  try {
    const { locale, sort } = settings;

    const { data }: GetMDNPagesResponse = await api.get('/search', {
      params: {
        q: params,
        locale,
        sort,
      },
    });

    const results: JSONRPCResponse<Methods>[] = [];

    data.documents.forEach(({ mdn_url, summary, title }) => {
      const subtitle = summary.replace(/(\n\s)/gm, '');

      results.push({
        title: title,
        subtitle,
        method: 'open_result',
        params: [mdn_url],
        iconPath: 'app.png',
      });
    });

    showResult(...results);
  } catch (err) {
    if (axios.isAxiosError(err) || err instanceof Error) {
      return showResult({
        title: 'Error',
        subtitle: err.message,
      });
    }
  }
});

on('open_result', () => {
  const url = `https://developer.mozilla.org${params}`;
  open(url);
});

run();
