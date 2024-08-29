import * as arrow from "apache-arrow";
import initWasm, {
  Compression,
  readParquet,
  Table,
  writeParquet,
  WriterPropertiesBuilder,
} from "parquet-wasm";

async function test() {

    // Instantiate the WebAssembly context
    await initWasm();

    // Create Arrow Table in JS
    const LENGTH = 2000;
    const rainAmounts = Float32Array.from({ length: LENGTH }, () =>
    Number((Math.random() * 20).toFixed(1))
    );

    const rainDates = Array.from(
    { length: LENGTH },
    (_, i) => new Date(Date.now() - 1000 * 60 * 60 * 24 * i)
    );

    const rainfall = arrow.tableFromArrays({
    precipitation: rainAmounts,
    date: rainDates,
    });

    // Write Arrow Table to Parquet

    // wasmTable is an Arrow table in WebAssembly memory
    const wasmTable = Table.fromIPCStream(arrow.tableToIPC(rainfall, "stream"));
    const writerProperties = new WriterPropertiesBuilder()
    .setCompression(Compression.ZSTD)
    .build();
    const parquetUint8Array = writeParquet(wasmTable, writerProperties);

    // Read Parquet buffer back to Arrow Table
    // arrowWasmTable is an Arrow table in WebAssembly memory
    const arrowWasmTable = readParquet(parquetUint8Array);

    // table is now an Arrow table in JS memory
    const table = arrow.tableFromIPC(arrowWasmTable.intoIPCStream());
    console.log(table.schema.toString());

}

test();
