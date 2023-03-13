const networkDevices = [];

const netAPI = {
  /**
   * Connect to an IP address.
   * @param {string} ip IP address to connect to
   * @param {number} port Port to connect to
   */
  async connect(ip, port) {

  },

  /**
   *
   * @param {string} ip IP to listen on (can be 0.0.0.0 to attempt to listen on all IPs)
   * @param {number} port Port to listen on (can be from 0 to 65535)
   */
  async listen(ip, port) {

  },

  /**
   * Core network device stuff.
   */
  core: {
    /**
     * Adds a network device to the system.
     * @param {string} name Network device name (ex. relay0, lo)
     * @param {number} deviceID Device ID of the subnet (ex. 68 is Comcast from standard IPv4)
     * @param {number} firstSubnetID First subnet ID
     * @param {number} secondSubnetID Second subnet ID
     * @param {number[]} hostIDs All host IDs that you have for the object
     * @param {function} whenConnected Event called when you recieve a connection request from your IP
     * @param {function} whenListened Event called when you recieve a listen request from your IP
     * @returns {object} Network device object
     */
    addNetworkDevice(name, deviceID, firstSubnetID, secondSubnetID, hostIDs, whenConnected, whenListened) {
      const checkIfHostIDsAreAnInteger = (elem) => typeof elem == "number";
      const checkIfHostIDsAreAbove255 = (elem) => elem > 255;

      // Validate that everything is the correct type, which is an number, currently
      if (
        typeof deviceID != "number" ||
        typeof firstSubnetID != "number" ||
        typeof secondSubnetID != "number" ||
        !hostIDs.some(checkIfHostIDsAreAnInteger)
      ) {
        throw new Error("Any part of the virtual IP address(es) are not a number!");
      }

      // Validate that everything is not above 255, the limit
      // Since I'm trying to base this off of IPv4.
      if (
        deviceID > 255 ||
        firstSubnetID > 255 ||
        secondSubnetID > 255 ||
        hostIDs.some(checkIfHostIDsAreAbove255)
      ) {
        throw new Error("IP Address too big!");
      }

      // Network device generated.
      const netDevice = {
        name,
        networkManifest: {
          deviceID,
          firstSubnetID,
          secondSubnetID
        },
        eventDispatchers: {
          whenConnected,
          whenListened
        },
        hostIDs
      };

      networkDevices.push(netDevice);
      return netDevice;
    },

    /**
     * Gets all the network devices on the system.
     * @returns {object} List of all network devices on the system
     */
    getNetworkDevices() {
      return networkDevices.map((item) => {
        item.name,
        item.networkManifest,
        item.hostIDs
      })
    },
  },
};

export { netAPI };
