const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const SAP_BASE_URL =
  "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZEMPLOYEE_PORTAL20_SRV";

const SAP_USERNAME = "K901990";
const SAP_PASSWORD = "Fathim@2004";

const sapConfig = {
  auth: {
    username: SAP_USERNAME,
    password: SAP_PASSWORD
  },
  headers: {
    Accept: "application/json"
  }
};

app.get("/", (req, res) => {
  res.send("Employee Portal Node Server Running");
});

/* LOGIN */

app.post("/login", async (req, res) => {

  try {

    console.log("BODY RECEIVED:", req.body);

    const username = req.body?.username;
    const password = req.body?.password;

    if (!username || !password) {

      return res.status(400).json({
        success: false,
        error: "Username or Password missing"
      });

    }

    const tokenResponse = await axios.get(
      `${SAP_BASE_URL}/`,
      {
        auth: {
          username: SAP_USERNAME,
          password: SAP_PASSWORD
        },
        headers: {
          "X-CSRF-Token": "Fetch"
        }
      }
    );

    const csrfToken =
      tokenResponse.headers["x-csrf-token"];

    const cookies =
      tokenResponse.headers["set-cookie"];

    const response = await axios.post(
      `${SAP_BASE_URL}/LoginSet`,
      {
        Username: username,
        Password: password
      },
      {
        auth: {
          username: SAP_USERNAME,
          password: SAP_PASSWORD
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Cookie: cookies ? cookies.join("; ") : ""
        }
      }
    );

    const status =
      response?.data?.d?.Status;

    if (status === "Success") {

      return res.json({
        success: true,
        data: response.data
      });

    }

    return res.status(401).json({
      success: false,
      error: "Invalid Credentials"
    });

  } catch (error) {

    console.log(
      "LOGIN ERROR:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error:
        error.response?.data ||
        error.message
    });

  }

});

/* PROFILE */

app.get("/profile/:empid", async (req, res) => {

  try {

    const empid = req.params.empid;

    console.log("PROFILE API HIT:", empid);

    const url =
      `${SAP_BASE_URL}/EmployeeProfileSet('${empid}')`;

    console.log("PROFILE URL:", url);

    const response = await axios.get(
      url,
      {
        auth: {
          username: SAP_USERNAME,
          password: SAP_PASSWORD
        },
        headers: {
          Accept: "application/json"
        }
      }
    );

    console.log(
      "PROFILE RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    res.json(response.data);

  } catch (error) {

    console.log(
      "PROFILE ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Employee Profile API Failed"
    });

  }

});

/* LEAVE */

app.get("/leave/:empid", async (req, res) => {

  try {

    const empid = req.params.empid;

    const url =
      `${SAP_BASE_URL}/EmpLeaveSet?$filter=EmpId eq '${empid}'&$format=json`;

    const response =
      await axios.get(
        url,
        sapConfig
      );

    res.json(response.data);

  } catch (error) {

    console.log(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      error: "Leave API Failed"
    });

  }

});

/* PAYSLIP HEADER */

app.get("/payslipheader/:empid", async (req, res) => {

  try {

    const empid = req.params.empid;

    const url =
      `${SAP_BASE_URL}/PayslipHeaderSet(EmpId='${empid}')?$format=json`;

    const response =
      await axios.get(
        url,
        sapConfig
      );

    res.json(response.data);

  } catch (error) {

    console.log(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      error: "Payslip Header API Failed"
    });

  }

});

/* PAYSLIP ITEMS */

app.get("/payslipitems/:empid", async (req, res) => {

  try {

    const empid = req.params.empid;

    const url =
      `${SAP_BASE_URL}/PayslipItemSet?$filter=EmpId eq '${empid}'&$format=json`;

    const response =
      await axios.get(
        url,
        sapConfig
      );

    res.json(response.data);

  } catch (error) {

    console.log(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      error: "Payslip Item API Failed"
    });

  }

});

/* PAYSLIP HISTORY */

app.get("/paysliphistory/:empid", async (req, res) => {

  try {

    const empid = req.params.empid;

    const url =
      `${SAP_BASE_URL}/PayslipHistorySet?$filter=EmpId eq '${empid}'&$format=json`;

    const response =
      await axios.get(
        url,
        sapConfig
      );

    res.json(response.data);

  } catch (error) {

    console.log(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      error: "Payslip History API Failed"
    });

  }

});

/* PAYSLIP PDF */

app.get("/payslippdf/:empid/:month/:year", async (req, res) => {

  try {

    const { empid, month, year } =
      req.params;

    const url =
      `${SAP_BASE_URL}/PayslipPDFSet(EmpId='${empid}',PayMonth='${month}',PayYear='${year}')?$format=json`;

    const response =
      await axios.get(
        url,
        sapConfig
      );

    const pdfBase64 =
      response?.data?.d?.PdfString;

    if (!pdfBase64) {

      return res.status(404).json({
        error: "PDF Not Found"
      });

    }

    const pdfBuffer =
      Buffer.from(
        pdfBase64,
        "base64"
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.send(pdfBuffer);

  } catch (error) {

    console.log(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      error: "Payslip PDF API Failed"
    });

  }

});

const PORT = 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});