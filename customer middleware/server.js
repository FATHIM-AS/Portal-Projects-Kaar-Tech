const express = require('express');
const axios = require('axios');
const cors = require('cors');
const xml2js = require('xml2js');
const https = require('https');

const app = express();
app.use(cors());

const PORT = 3000;

const SAP_AUTH = {
  username: "K901990",
  password: "Fathim@2004"
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const parser = new xml2js.Parser({ explicitArray: false });

async function callSAP(url, xml, isHttps = false) {
  const response = await axios.post(url, xml, {
    headers: {
      "Content-Type": "text/xml",
      "SOAPAction": ""
    },
    auth: SAP_AUTH,
    timeout: 60000,
    ...(isHttps && { httpsAgent })
  });

  return response.data;
}

app.get('/login/:kunnr/:password', async (req, res) => {
  const { kunnr, password } = req.params;

  const paddedKunnr = kunnr.padStart(10, '0');

  const xml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Body>
<urn:ZFM_SD_CUST_LOGIN_20>
<P_CUST_ID>${paddedKunnr}</P_CUST_ID>
<P_PASSWORD>${password}</P_PASSWORD>
</urn:ZFM_SD_CUST_LOGIN_20>
</soapenv:Body>
</soapenv:Envelope>`;

  try {
    const data = await callSAP(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zws_custlogin_20?sap-client=100",
      xml
    );

    parser.parseString(data, (err, result) => {
      if (err) return res.status(500).send("Parse Error");

      console.log(" LOGIN RESPONSE:", JSON.stringify(result, null, 2));

      const body = result["soap-env:Envelope"]?.["soap-env:Body"];
      const responseData = body?.["n0:ZFM_SD_CUST_LOGIN_20Response"];

      const status = responseData?.E_STATUS || '';
      const message = responseData?.E_MESSAGE || '';
      const name = responseData?.E_NAME || paddedKunnr; // if name exists

      res.json({
        status,
        message,
        name
      });
    });

  } catch (err) {
    console.error(" LOGIN ERROR:", err.response?.data || err.message);
    res.status(500).send(err.message);
  }
});

app.get('/profile/:kunnr', async (req, res) => {
  const xml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Body>
<urn:ZFM_SD_CUST_PROFILE_20>
<P_CUST_ID>${req.params.kunnr}</P_CUST_ID>
</urn:ZFM_SD_CUST_PROFILE_20>
</soapenv:Body>
</soapenv:Envelope>`;

  try {
    const data = await callSAP(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zws_custprofile_20?sap-client=100",
      xml
    );

    parser.parseString(data, (err, result) => {
      const body = result["soap-env:Envelope"]["soap-env:Body"];
      const d = body["n0:ZFM_SD_CUST_PROFILE_20Response"];

      res.json({
        kunnr: d.E_KUNNR,
        name: d.E_NAME1,
        city: d.E_ORT01,
        country: d.E_LAND1
      });
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/finance/:kunnr', async (req, res) => {
  const xml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Body>
<urn:ZFM_FI_FINANCE_20>
<IV_KUNNR>${req.params.kunnr}</IV_KUNNR>
</urn:ZFM_FI_FINANCE_20>
</soapenv:Body>
</soapenv:Envelope>`;

  try {
    const data = await callSAP(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zws_finance_20?sap-client=100",
      xml
    );

    parser.parseString(data, (err, result) => {
      res.json(result);
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/delivery/:kunnr', async (req, res) => {
  const xml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Body>
<urn:ZFM_SD_DELIVERY_20>
<IV_KUNNR>${req.params.kunnr}</IV_KUNNR>
</urn:ZFM_SD_DELIVERY_20>
</soapenv:Body>
</soapenv:Envelope>`;

  try {
    const data = await callSAP(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zws_delivery_20?sap-client=100",
      xml
    );

    parser.parseString(data, (err, result) => {
      res.json(result["soap-env:Envelope"]["soap-env:Body"]["n0:ZFM_SD_DELIVERY_20Response"]);
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/enquiry/:kunnr', async (req, res) => {
  const xml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Body>
<urn:ZFM_SD_ENQUIRY_20>
<IV_CUSTOMER_ID>${req.params.kunnr}</IV_CUSTOMER_ID>
</urn:ZFM_SD_ENQUIRY_20>
</soapenv:Body>
</soapenv:Envelope>`;

  try {
    const data = await callSAP(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zws_enquiry_20?sap-client=100",
      xml
    );

    parser.parseString(data, (err, result) => {
      res.json(result["soap-env:Envelope"]["soap-env:Body"]["n0:ZFM_SD_ENQUIRY_20Response"]);
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/sales/:kunnr', async (req, res) => {

  const kunnr = req.params.kunnr.padStart(10, '0');

  const xml = `
<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/"
                   xmlns:n0="urn:sap-com:document:sap:rfc:functions">
   <soap-env:Header/>
   <soap-env:Body>
      <n0:ZFM_SD_SALESORDER_20>
         <IV_CUSTOMER_ID>${kunnr}</IV_CUSTOMER_ID>
      </n0:ZFM_SD_SALESORDER_20>
   </soap-env:Body>
</soap-env:Envelope>`;

  try {
    console.log(" SALES REQUEST:", kunnr);

    const data = await callSAP(
      "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zws_salesorder_20?sap-client=100",
      xml
    );

    parser.parseString(data, (err, result) => {
      if (err) return res.status(500).send("Parse Error");

      console.log(" SALES RESPONSE:", JSON.stringify(result));

      res.json(
        result["soap-env:Envelope"]?.["soap-env:Body"]?.["n0:ZFM_SD_SALESORDER_20Response"]
      );
    });

  } catch (err) {
    console.error(" SALES ERROR:", err.response?.data || err.message);
    res.status(500).send(err.response?.data || err.message);
  }
});

// ===================================================
// invoice pdf
// ===================================================
app.get('/invoice/:vbeln', async (req, res) => {
  let vbeln = req.params.vbeln.padStart(10, '0');

  const xml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Body>
<urn:ZFM_GETINVOICEPDF_20>
<IV_VBELN>${vbeln}</IV_VBELN>
</urn:ZFM_GETINVOICEPDF_20>
</soapenv:Body>
</soapenv:Envelope>`;

  try {
    const response = await axios.post(
      "https://AZKTLDS5CP.kcloud.com:44300/sap/bc/srt/scs/sap/zws_getinvoicepdf_20?sap-client=100",
      xml,
      {
        headers: {
          "Content-Type": "text/xml",
          "SOAPAction": ""
        },
        auth: SAP_AUTH,
        httpsAgent,
        timeout: 60000,
        responseType: "text" 
      }
    );

    const data = response.data;

    console.log(" INVOICE RAW RESPONSE:", data.substring(0, 500));

    parser.parseString(data, (err, result) => {
      if (err) {
        console.error(" XML PARSE ERROR:", err);
        return res.status(500).send("XML Parse Error");
      }

      try {
        const pdfBase64 =
          result["soap-env:Envelope"]?.["soap-env:Body"]?.["n0:ZFM_GETINVOICEPDF_20Response"]?.EV_PDF;

        if (!pdfBase64) {
          console.error(" PDF NOT FOUND IN RESPONSE");
          return res.status(404).send("PDF not found");
        }

        const buffer = Buffer.from(pdfBase64, "base64");

        if (!buffer || buffer.length === 0) {
          console.error(" EMPTY PDF BUFFER");
          return res.status(500).send("Invalid PDF data");
        }

        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename=invoice_${vbeln}.pdf`,
          "Content-Length": buffer.length
        });

        res.end(buffer);

      } catch (e) {
        console.error(" PDF EXTRACTION ERROR:", e);
        res.status(500).send("Error extracting PDF");
      }
    });

  } catch (err) {
    console.error(" INVOICE ERROR:", err.response?.data || err.message);
    res.status(500).send("Failed to fetch invoice");
  }
});
// ===================================================
// ROOT
// ===================================================
app.get('/', (req, res) => {
  res.send(" SAP Middleware Running");
});

// ===================================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


