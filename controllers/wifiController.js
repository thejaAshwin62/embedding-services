import wifi from "node-wifi";

wifi.init({
  iface: null, // network interface, if set, only that interface's wifi will be scanned
});

export const getWifiList = async (req, res) => {
  try {
    const networks = await wifi.scan();
    res.status(200).json({
      status: "success",
      data: {
        networks,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to scan wifi networks",
      error: error.message,
    });
  }
};
