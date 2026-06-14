import buffer from "buffer";

if (typeof buffer.SlowBuffer === "undefined") {
    buffer.SlowBuffer = function (size) {
        return buffer.Buffer.allocUnsafe(size);
    };
    buffer.SlowBuffer.prototype = Object.create(buffer.Buffer.prototype);
}
