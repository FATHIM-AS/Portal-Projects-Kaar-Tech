const axios = require("axios");
const https = require("https");
const config = require("../config/sap.config");

const agent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true
});

const callSAPGet = async (endpoint) => {
  try {
    const url = `${config.baseURL}/${endpoint}`;

    console.log(" GET:", url);

    const response = await axios.get(url, {
      auth: config.auth,
      headers: {
        "Accept": "application/json"
      },
      params: {
        "$format": "json"
      },
      httpsAgent: agent,
      timeout: 60000
    });

    return response.data;

  } catch (error) {
    console.error("GET ERROR:", error.response?.data || error.message);
    throw error;
  }
};
const callSAPPDF = async (endpoint) => {
  try {
    const url = `${config.baseURL}/${endpoint}`;

    console.log(" PDF GET:", url);

    const response = await axios.get(url, {
      auth: config.auth,
      headers: {
        "Accept": "application/json"
      },
      params: {
        "$format": "json"
      },
      httpsAgent: agent,
      timeout: 60000
    });

    return response.data;

  } catch (error) {
    console.error(" PDF ERROR:", error.response?.data || error.message);
    throw error;
  }
};

const getCSRFToken = async () => {
  const response = await axios.get(config.baseURL, {
    auth: config.auth,
    headers: {
      "x-csrf-token": "Fetch"
    },
    httpsAgent: agent
  });

  return {
    token: response.headers["x-csrf-token"],
    cookies: response.headers["set-cookie"]
  };
};

const callSAPPost = async (endpoint, body) => {
  try {
    const baseUrl = config.baseURL;

    const basicAuth = Buffer.from(
      `${config.auth.username}:${config.auth.password}`
    ).toString("base64");

    const tokenRes = await axios.get(baseUrl, {
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "x-csrf-token": "Fetch"
      },
      httpsAgent: agent
    });

    const csrfToken = tokenRes.headers["x-csrf-token"];
    const cookies = tokenRes.headers["set-cookie"];

    const payload = {
      d: {
        VendorId: body.vendorId,   
        Password: body.password
      }
    };

    const response = await axios.post(
      `${baseUrl}/${endpoint}`,
      payload,
      {
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "x-csrf-token": csrfToken,
          "Cookie": cookies.join(";"),
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        httpsAgent: agent
      }
    );

    return response.data;

  } catch (error) {
    console.error(" LOGIN ERROR FULL:");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    throw error;
  }
};
module.exports = {
  callSAPGet,
  callSAPPost,
  callSAPPDF
};