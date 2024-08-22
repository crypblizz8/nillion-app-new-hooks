import * as React from "react";
import {
  useFetchValue,
  useRunProgram,
  useStoreValue,
  useStoreProgram,
  useNillion,
} from "@nillion/client-react-hooks";
import { useEffect, useState } from "react";
import { ProgramName } from "@nillion/client-core";
import { transformNadaProgramToUint8Array } from "@/utils/transformNadaProgramToUint8Array";
import { error } from "console";

export default function Compute() {
  const [selectedProgramCode, setSelectedProgramCode] = useState();
  const [loadingStoringProgram, setLoadingStoringProgram] = useState(false);
  const [secretValue1, setSecretValue1] = useState<string>();
  const [secretValue2, setSecretValue2] = useState<string>();

  // Receipts
  const [programID, setProgramID] = useState<string>();
  const [secretValue1ID, setSecretValue1ID] = useState<string>();
  const [secretValue2ID, setSecretValue2ID] = useState<string>();

  const client = useNillion();

  const storeProgram = useStoreProgram();
  const PROGRAM_NAME = "secret_addition";

  // const [id, setId] = useState("");
  const storeValue = useStoreValue();
  console.log("storeValue", storeValue);

  const handleStoreSecretInteger1 = async () => {
    try {
      const result = await storeValue.mutateAsync({
        values: {
          mySecretInt: Number(secretValue1), // This will be stored as a SecretInteger
        },
        ttl: 3600, // Time to live in seconds (e.g., 1 hour)
      });
      console.log("Stored SecretInteger 1:", result);
      setSecretValue1ID(result);
    } catch (error) {
      console.error("Error storing SecretInteger:", error);
    }
  };

  const handleStoreSecretInteger2 = async () => {
    try {
      const result = await storeValue.mutateAsync({
        values: {
          mySecretInt: Number(secretValue2), // This will be stored as a SecretInteger
        },
        ttl: 3600, // Time to live in seconds (e.g., 1 hour)
      });
      console.log("Stored SecretInteger2:", result);
      setSecretValue2ID(result);
    } catch (error) {
      console.error("Error storing SecretInteger2:", error);
    }
  };

  const handleStoreProgram = async () => {
    try {
      const programBinary = await transformNadaProgramToUint8Array(
        `./programs/${PROGRAM_NAME}.nada.bin`
      );
      const result = await storeProgram.mutateAsync({
        name: PROGRAM_NAME,
        program: programBinary,
      });
      setProgramID(result!);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    const fetchProgramCode = async () => {
      const response = await fetch(`./programs/secret_addition.py`);
      const text = await response.text();
      setSelectedProgramCode(text);
    };
    fetchProgramCode();
  }, [selectedProgramCode]);

  return (
    <div className="flex flex-col justify-center min-h-screen p-8">
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Program Code:</h3>
        <div className="border-2 border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto bg-white">
          <pre className="whitespace-pre-wrap break-words">
            <code>{selectedProgramCode}</code>
          </pre>
        </div>
        <button
          onClick={() => handleStoreProgram()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2 inline-block"
        >
          Store Program
        </button>
      </div>

      {programID && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Program ID: {programID}</p>
        </div>
      )}

      <div className="border-t border-gray-300 my-4"></div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-left">Store Secret:</h3>
        <p> Store your int_1</p>
        <input
          type="number"
          placeholder="Enter your secret value"
          value={secretValue1}
          onChange={(e) => setSecretValue1(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => handleStoreSecretInteger1()}
          className="bg-blue-500 mb-4 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2"
        >
          Store Secret
        </button>

        {secretValue1ID && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Secret Value 1 ID: {secretValue1ID}
            </p>
          </div>
        )}

        <p> Store your int_2</p>
        <input
          type="number"
          placeholder="Enter your secret value"
          value={secretValue2}
          onChange={(e) => setSecretValue2(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => handleStoreSecretInteger2()}
          className="bg-blue-500 mb-4 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2"
        >
          Store Secret
        </button>

        {secretValue2ID && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Secret Value 2 ID: {secretValue2ID}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Compute Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-left">Compute:</h3>
      </div>
    </div>
  );
}
