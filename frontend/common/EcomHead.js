import Head from "next/head";

export default function EcomHead({ title, description }) {
  const titleText = `Gift SH ${title ? " | " + title?.toString() : ""}`;
  return (
    <Head>
      <title>{titleText}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
