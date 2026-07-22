import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Analytics } from '@vercel/analytics/next';
import type { AppProps } from 'next/app';
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import Head from 'next/head';
import { ProjectModalProvider } from '../components/InkPaper/ProjectModal';
import { theme } from '../theme';

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme}>
      <Head>
        <title>Nehemias Luna — PM · AI · Sports Writer</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <div className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
        <ProjectModalProvider>
          <Component {...pageProps} />
        </ProjectModalProvider>
      </div>
      <Analytics />
    </MantineProvider>
  );
}
