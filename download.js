const fs = require("fs");
const https = require("https");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const loadedInvoices = fs.readFileSync("./invoices.csv", "utf8");
const invoices = loadedInvoices.split("\n");

const getPdf = async (invoice) => {
  const pdf = await stripe.invoices
    .retrieve(invoice)
    .then((data) => {
      return data.invoice_pdf;
    })
    .catch((err) => {
      console.log(err);
    });
  return pdf;
};

/**
 * Download a resource from `url` to `dest`.
 * @param {string} url - Valid URL to attempt download of resource
 * @param {string} dest - Valid path to save the file.
 * @returns {Promise<void>} - Returns asynchronously when successfully completed download
 * original: https://stackoverflow.com/a/62786397
 */
function download(url, dest) {
  return new Promise((resolve, reject) => {
    // Check file does not exist yet before hitting network
    fs.access(dest, fs.constants.F_OK, (err) => {
      if (err === null) reject("File already exists");

      const request = https.get(url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(dest, { flags: "wx" });
          file.on("finish", () => resolve());
          file.on("error", (err) => {
            file.close();
            if (err.code === "EEXIST") reject("File already exists");
            else fs.unlink(dest, () => reject(err.message)); // Delete temp file
          });
          response.pipe(file);
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          //Recursively follow redirects, only a 200 will resolve.
          download(response.headers.location, dest).then(() => resolve());
        } else {
          reject(
            `Server responded with ${response.statusCode}: ${response.statusMessage}`
          );
        }
      });

      request.on("error", (err) => {
        reject(err.message);
      });
    });
  });
}

invoices.forEach(async (invoice, index) => {
  const pdf = await getPdf(invoice);
  const pdfFile = `./invoices/${invoice}.pdf`;
  setTimeout(async () => {
    await download(pdf, pdfFile);
  }, 300 * index);
});
