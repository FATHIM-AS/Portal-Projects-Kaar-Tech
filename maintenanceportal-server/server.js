const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const SAP_BASE_URL = process.env.SAP_BASE_URL;

const auth = {
  username: process.env.SAP_USERNAME,
  password: process.env.SAP_PASSWORD
};

app.post("/api/login", async (req, res) => {
  try {
    let { pernr, password } = req.body;

    if (!pernr || !password) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and Password are required"
      });
    }

    pernr = pernr.toString().padStart(8, "0");

    const tokenResponse = await axios.get(
      `${SAP_BASE_URL}/sap/opu/odata/SAP/ZPLANT_MAINTENANCE_SRV_SRV/`,
      {
        auth,
        headers: {
          "X-CSRF-Token": "Fetch",
          Accept: "application/json"
        }
      }
    );

    const csrfToken = tokenResponse.headers["x-csrf-token"];
    const cookies = tokenResponse.headers["set-cookie"];

    console.log("CSRF TOKEN:", csrfToken);
    console.log("COOKIES:", cookies);

    const sapResponse = await axios.post(
      `${SAP_BASE_URL}/sap/opu/odata/SAP/ZPLANT_MAINTENANCE_SRV_SRV/lOGINSet`,
      {
        Pernr: pernr,
        Password: password
      },
      {
        auth,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Cookie: cookies ? cookies.join(";") : ""
        }
      }
    );

    res.json(sapResponse.data);

  } catch (error) {

    console.error(
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

app.get("/api/plants", async (req, res) => {
  try {
    const { werks } = req.query;

    const response = await axios.get(
      `${SAP_BASE_URL}/sap/opu/odata/SAP/ZPLANT_MAINTENANCE_SRV_SRV/PLANTNAMESet?$filter=Werks eq '${werks}'`,
      {
        auth,
        headers: {
          Accept: "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {

    res.status(500).json(
      error.response?.data || error.message
    );
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    const { iwerk } = req.query;

    const response = await axios.get(
      `${SAP_BASE_URL}/sap/opu/odata/SAP/ZPLANT_MAINTENANCE_SRV_SRV/PLANTNOTIFICATIONSet?$filter=Iwerk eq '${iwerk}'`,
      {
        auth,
        headers: {
          Accept: "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {

    res.status(500).json(
      error.response?.data || error.message
    );
  }
});

app.get("/api/workorders", async (req, res) => {
  try {
    const { werks } = req.query;

    const response = await axios.get(
      `${SAP_BASE_URL}/sap/opu/odata/SAP/ZPLANT_MAINTENANCE_SRV_SRV/WORKORDERSet?$filter=Werks eq '${werks}'`,
      {
        auth,
        headers: {
          Accept: "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {

    res.status(500).json(
      error.response?.data || error.message
    );
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});