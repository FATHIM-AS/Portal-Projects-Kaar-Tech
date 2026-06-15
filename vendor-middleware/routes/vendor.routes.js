const express = require("express");
const router = express.Router();
const {
  callSAPGet,
  callSAPPost
} = require("../middleware/sap.middleware");

const formatVendorId = (id) => {
  const str = String(id);
  if (/^\d{10}$/.test(str)) return str;
  return str.padStart(10, "0");
};

const fetchFromSAP = async (endpoint, res) => {
  try {
    console.log(" ENDPOINT:", endpoint);

    const data = await callSAPGet(endpoint);

    let results = [];

    if (data?.d?.results) results = data.d.results;
    else if (data?.d) results = [data.d];
    else results = data || [];

    res.json({ success: true, data: results });

  } catch (error) {
    console.error(" SAP ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message?.value || error.message
    });
  }
};

router.post("/login", async (req, res) => {
  try {
    const { vendorId, password } = req.body;

    const data = await callSAPPost("VENDORLOGINSet", {
      vendorId,
      password
    });

    const sapData = data?.d;

    res.json({
      success: sapData?.IsValid,
      message: sapData?.Message,
      vendor: { vendorId: sapData?.VendorId }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/login/:vendorId/:password", async (req, res) => {
  try {
    let { vendorId, password } = req.params;
    vendorId = formatVendorId(vendorId);

    const data = await callSAPPost("VENDORLOGINSet", {
      vendorId,
      password
    });

    const sapData = data?.d;

    res.json({
      success: sapData?.IsValid,
      message: sapData?.Message,
      vendor: { vendorId: sapData?.VendorId }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/profile/:vendorId", async (req, res) => {
  const vendorId = formatVendorId(req.params.vendorId);

  await fetchFromSAP(`VENDORPROFILESet('${vendorId}')`, res);
});

router.get("/po/:vendorId", async (req, res) => {
  const vendorId = formatVendorId(req.params.vendorId);

  await fetchFromSAP(
    `VENDORPOSet?$filter=VendorId eq '${vendorId}'`,
    res
  );
});

router.get("/gr/:vendorId", async (req, res) => {
  const vendorId = formatVendorId(req.params.vendorId);

  await fetchFromSAP(
    `VENDORGRSet?$filter=VendorId eq '${vendorId}'`,
    res
  );
});

router.get("/invoice/:vendorId", async (req, res) => {
  try {
    let vendorId = req.params.vendorId.padStart(10, "0");

    console.log(" INVOICE HEADER:", vendorId);

    const data = await callSAPGet(
      `VENDORINVOICEHSet?$filter=Lifnr eq '${vendorId}'`
    );

    const results = data?.d?.results || [];

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error(" INVOICE ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/invoice-pdf/:belnr", async (req, res) => {
  try {
    let belnr = req.params.belnr.padStart(10, "0");

    console.log(" PDF FETCH:", belnr);

    const data = await callSAPGet(
      `VENDORINVOICEPDFSet('${belnr}')`
    );
    const base64PDF =
      data?.d?.PdfString ||
      data?.d?.pdf_string ||
      data?.d?.PDF ||
      data?.d?.Pdf;

    if (!base64PDF) {
      return res.status(404).json({
        success: false,
        message: "PDF not found from SAP"
      });
    }

    const buffer = Buffer.from(base64PDF, "base64");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice_${belnr}.pdf`,
      "Content-Length": buffer.length
    });

    res.end(buffer);

  } catch (error) {
    console.error(" PDF ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
router.get("/aging/:vendorId", async (req, res) => {
  try {
    const vendorId = formatVendorId(req.params.vendorId);

    const data = await callSAPGet(
      `VENDORAGINGSet?$filter=Lifnr eq '${vendorId}'`
    );

    res.json({
      success: true,
      data: data?.d?.results || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
router.get("/memo/:vendorId", async (req, res) => {
  const vendorId = formatVendorId(req.params.vendorId);

  await fetchFromSAP(
    `VENDORMEMOSet?$filter=VendorId eq '${vendorId}'`,
    res
  );
});

router.get("/rfq/:vendorId", async (req, res) => {
  const vendorId = formatVendorId(req.params.vendorId);

  await fetchFromSAP(
    `VENDORRFQSet?$filter=VendorId eq '${vendorId}'`,
    res
  );
});

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Vendor middleware working "
  });
});

module.exports = router;