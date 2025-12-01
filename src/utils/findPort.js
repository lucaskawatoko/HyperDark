const net = require("net");

/**
 * Encontra uma porta livre automaticamente.
 * @param {number} startingPort - Porta inicial.
 * @returns {Promise<number>} - A primeira porta disponível.
 */
function findAvailablePort(startingPort = 5500) {
    return new Promise((resolve) => {
        function check(port) {
            const server = net.createServer();

            server.once("error", () => {
                // Porta ocupada → testar próxima
                check(port + 1);
            });

            server.once("listening", () => {
                server.close(() => resolve(port));
            });

            server.listen(port);
        }

        check(startingPort);
    });
}

module.exports = findAvailablePort;
