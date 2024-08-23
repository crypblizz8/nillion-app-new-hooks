import * as React from "react";
import {
  useSetPermissions,
  useRunProgram,
  useStoreValue,
  useStoreProgram,
  useNillion,
  useFetchProgramOutput,
  useFetchPermissions,
} from "@nillion/client-react-hooks";
import { useEffect, useState } from "react";
import {
  ProgramId,
  PartyName,
  Permissions,
  PartyId,
  StoreId,
  ProgramBindings,
  NadaValues,
  NadaValue,
  NamedValue,
} from "@nillion/client-core";
import { transformNadaProgramToUint8Array } from "@/utils/transformNadaProgramToUint8Array";

export default function Compute() {
  const [selectedProgramCode, setSelectedProgramCode] = useState();
  //TODO Loading States
  const [loadingStoringProgram, setLoadingStoringProgram] = useState(false);
  const [secretValue1, setSecretValue1] = useState<number>(0);
  const [secretValue2, setSecretValue2] = useState<number>(0);
  const [programID, setProgramID] = useState<ProgramId>();
  const [secretValue1ID, setSecretValue1ID] = useState<StoreId>();
  const [secretValue2ID, setSecretValue2ID] = useState<StoreId>();
  const [partyID, setPartyID] = useState<PartyId>();
  const PARTY_NAME = "Party1" as PartyName;
  const PROGRAM_NAME = "secret_addition";
  const [computeResult, setComputeResult] = useState<any | null>(null);
  const [computeID, setComputeID] = useState<any | null>(null);

  const client = useNillion();
  const storeProgram = useStoreProgram();
  const storeValue = useStoreValue();
  const runProgram = useRunProgram();

  const fetchProgram = useFetchProgramOutput({
    id: computeID,
  });

  //   useEffect(() => {
  //     if (client?.ready && client.vm.partyId) {
  //       console.log("Client ready, partyId:", client.vm.partyId);
  //       setPartyID(client.vm.partyId);
  //     }
  //   }, [client?.ready, client?.vm.partyId]);

  //   const handleUseProgram = async () => {
  //     try {
  //       const bindings = ProgramBindings.create(programID!);
  //       bindings.addInputParty(PARTY_NAME as PartyName, partyID as PartyId);
  //       bindings.addOutputParty(PARTY_NAME as PartyName, partyID as PartyId);

  //       const values = NadaValues.create();
  //       values.insert("my_int1" as NamedValue, secretValue1ID as StoreId);
  //       values.insert("my_int2" as NamedValue, secretValue2ID as StoreId);

  //       const res = await runProgram.mutate({
  //         bindings: bindings as ProgramBindings,
  //         values: values,
  //         storeIds: [secretValue1ID, secretValue2ID] as StoreId[],
  //       });

  //       console.log("Program executed successfully:", res);
  //     } catch (error) {
  //       console.error("Error executing program:", error);
  //       throw error;
  //     }
  //   };

  //   const handleUseProgram = async () => {
  //     try {
  //       // Bindings
  //       const bindings = ProgramBindings.create(programID!);
  //       bindings.addInputParty(PARTY_NAME as PartyName, partyID as PartyId);
  //       bindings.addOutputParty(PARTY_NAME as PartyName, partyID as PartyId);

  //       const values = NadaValues.create()
  //         .insert(
  //           NamedValue.parse("my_int1"),
  //           NadaValue.createSecretInteger(secretValue1)
  //         )
  //         .insert(
  //           NamedValue.parse("my_int2"),
  //           NadaValue.createSecretInteger(secretValue2)
  //         );

  //       const res = await runProgram.mutateAsync({
  //         bindings: bindings as ProgramBindings,
  //         values,
  //         storeIds: [secretValue1ID, secretValue2ID] as StoreId[],
  //       });

  //       console.log("-----");
  //       console.log("Program executed successfully:", res);
  //       setComputeResult(res);
  //     } catch (error) {
  //       console.error("Error executing program:", error);
  //       throw error;
  //     }
  //   };

  const handleUseProgram = async () => {
    try {
      // Bindings
      const bindings = ProgramBindings.create(programID!);
      bindings.addInputParty(
        PARTY_NAME as PartyName,
        client.vm.partyId as PartyId
      );
      bindings.addOutputParty(
        PARTY_NAME as PartyName,
        client.vm.partyId as PartyId
      );

      const values = NadaValues.create()
        .insert(
          NamedValue.parse("my_int1"),
          NadaValue.createSecretInteger(secretValue1)
        )
        .insert(
          NamedValue.parse("my_int2"),
          NadaValue.createSecretInteger(secretValue2)
        );

      const res = await runProgram.mutateAsync({
        bindings: bindings,
        values,
        // storeIds: [secretValue1ID, secretValue2ID] as StoreId[],
        storeIds: [],
      });

      console.log("Program executed successfully:", res);
      setComputeID(res);
      console.log("computer ID ----", computeID);
      //   const outputres = await client.fetchProgramOutput({
      //     id: res,
      //   });

      //   const outputres = await fetchProgram({
      //     id: res,
      //   });
      //   console.log("fetchProgram $$$", await fetchProgram.data);

      //   setComputeResult(outputres?.ok?.my_output.toString());
    } catch (error) {
      console.error("Error executing program:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (fetchProgram.data) {
      //   console.log("Program output:", fetchProgram.data.my_output.toString());
      setComputeResult(fetchProgram.data.my_output.toString());
    }
  }, [fetchProgram.data]);

  const handleStoreSecretInteger1 = async () => {
    try {
      const permissions = Permissions.create().allowCompute(
        client.vm.userId,
        programID as ProgramId
      );

      const result = await storeValue.mutateAsync({
        values: {
          mySecretInt: secretValue1, // This will be stored as a SecretInteger
        },
        ttl: 3600, // Time to live in seconds (e.g., 1 hour)
        permissions,
      });
      console.log("Stored SecretInteger 1:", result);
      setSecretValue1ID(result);
    } catch (error) {
      console.error("Error storing SecretInteger:", error);
    }
  };

  const handleStoreSecretInteger2 = async () => {
    try {
      const permissions = Permissions.create().allowCompute(
        client.vm.userId,
        programID as ProgramId
      );
      const result = await storeValue.mutateAsync({
        values: {
          mySecretInt: secretValue2,
        },
        ttl: 3600, // Time to live in seconds (e.g., 1 hour)
        permissions,
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

  // Fetch Nada Program Code.
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
          placeholder="Enter your secret value"
          value={secretValue1}
          onChange={(e) => setSecretValue1(Number(e.target.value))}
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
          placeholder="Enter your secret value"
          value={secretValue2}
          onChange={(e) => setSecretValue2(Number(e.target.value))}
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
        <button
          onClick={() => handleUseProgram()}
          className="bg-blue-500 mb-4 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2"
        >
          Compute
        </button>
        {computeResult && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Compute Result: {computeResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
