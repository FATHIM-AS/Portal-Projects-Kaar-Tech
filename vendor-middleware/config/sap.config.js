module.exports = {
  baseURL: "https://azktlds5cp.kcloud.com:44300/sap/opu/odata/sap/ZVENDOR_PORTAL_SRV20_SRV;sap-client=100",

  auth: {
    username: process.env.SAP_USERNAME,
    password: process.env.SAP_PASSWORD
  }
};