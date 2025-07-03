/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // https://stackoverflow.com/questions/51791163/warning-prop-classname-did-not-match-when-using-styled-components-with-seman
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
};

module.exports = nextConfig;
