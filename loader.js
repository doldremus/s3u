class Loader {
    constructor(){
        this.loadingInterval = null;
    }

    start(
        text = "",
        // chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"],
        chars = ['|', '/', '-', '\\'],
        delay = 100
    ) {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
        }
        let x = 0;
        this.loadingInterval = setInterval(function () {
            process.stdout.write("\r" + chars[x++] + " " + text);
            x = x % chars.length;
        }, delay);
    }

    stop() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
        }
        process.stdout.write("\r");
    }
}

module.exports = Loader;