import React, { useState, useEffect } from "react";
import Papa from "papaparse";

interface ScoringDataRow {
  Points: number;
  Discipline: string;
  Result: number;
  Gender: string;
  Environment: string;
}

interface GroupedData {
  [discipline: string]: {
    Male: ScoringDataRow[];
    Female: ScoringDataRow[];
  };
}

const App: React.FC = () => {
  const [scoringData, setScoringData] = useState<GroupedData>({});
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
  const [inputPoints, setInputPoints] = useState<number | "">("");

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/merged.csv");
      const reader = response.body?.getReader();
      const result = await reader?.read();
      const decoder = new TextDecoder("utf-8");
      const csv = decoder.decode(result?.value);

      Papa.parse(csv, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          if (Array.isArray(results.data)) {
            console.log("Parsed Data:", results.data); // Log the parsed data

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const transformedData = results.data.map((row: any) => {
              return {
                Points: row.Points,
                Discipline: row.Discipline,
                Result: row.Result,
                Gender: row.Gender,
                Environment: row.Environment,
              };
            });

            console.log("Transformed Data:", transformedData); // Log the transformed data

            const groupedData: GroupedData = transformedData.reduce(
              (acc, row) => {
                const discipline = row.Discipline;
                const gender = row.Gender;

                if (!acc[discipline]) {
                  acc[discipline] = { Male: [], Female: [] };
                }

                if (gender === "M") {
                  acc[discipline].Male.push(row);
                } else if (gender === "F") {
                  acc[discipline].Female.push(row);
                }

                return acc;
              },
              {} as GroupedData
            );

            console.log("Grouped Data:", groupedData); // Log the grouped data

            setScoringData(groupedData);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (error: any) => {
          console.error("Error parsing CSV:", error);
        },
      });
    };

    fetchData();
  }, []);

  const handleDisciplineChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedDiscipline(event.target.value);
  };

  const handlePointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      event.target.value === "" ? "" : parseInt(event.target.value, 10);
    if (value === "" || (value >= 1 && value <= 1400)) {
      setInputPoints(value);
    }
  };

  const shouldShowTables = selectedDiscipline || inputPoints !== "";

  useEffect(() => {
    console.log("Scoring Data:", scoringData); // Log the scoring data
  }, [scoringData]);

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <select
          onChange={handleDisciplineChange}
          value={selectedDiscipline}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Select Discipline</option>
          {Object.keys(scoringData).map((discipline) => (
            <option key={discipline} value={discipline}>
              {discipline}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={inputPoints}
          onChange={handlePointsChange}
          placeholder="Enter points (1-1400)"
          min="1"
          max="1400"
          className="p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        {shouldShowTables ? (
          selectedDiscipline ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">{selectedDiscipline}</h1>
              {Object.keys(scoringData[selectedDiscipline]).map(
                (gender, index) => {
                  const filteredData = scoringData[selectedDiscipline][
                    gender as "Male" | "Female"
                  ]
                    .filter(
                      (row: ScoringDataRow) =>
                        inputPoints === "" || row.Points === inputPoints
                    )
                    .sort(
                      (a: ScoringDataRow, b: ScoringDataRow) =>
                        b.Points - a.Points
                    );

                  return filteredData.length > 0 ? (
                    <div key={index} className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">{gender}</h2>
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 p-2 bg-gray-100">
                              Points
                            </th>
                            <th className="border border-gray-300 p-2 bg-gray-100">
                              Result
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((row, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              }
                            >
                              <td className="border border-gray-300 p-2">
                                {row.Points}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {row.Result}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null;
                }
              )}
            </div>
          ) : (
            Object.keys(scoringData).map((discipline) => {
              const hasData = Object.keys(scoringData[discipline]).some(
                (gender) => {
                  return (
                    scoringData[discipline][gender as "Male" | "Female"].filter(
                      (row: ScoringDataRow) =>
                        inputPoints === "" || row.Points === inputPoints
                    ).length > 0
                  );
                }
              );

              return hasData ? (
                <div key={discipline} className="mb-6">
                  <h1 className="text-2xl font-bold mb-4">{discipline}</h1>
                  {Object.keys(scoringData[discipline]).map((gender, index) => {
                    const filteredData = scoringData[discipline][
                      gender as "Male" | "Female"
                    ]
                      .filter(
                        (row: ScoringDataRow) =>
                          inputPoints === "" || row.Points === inputPoints
                      )
                      .sort(
                        (a: ScoringDataRow, b: ScoringDataRow) =>
                          b.Points - a.Points
                      );

                    return filteredData.length > 0 ? (
                      <div key={index} className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">{gender}</h2>
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 p-2 bg-gray-100">
                                Points
                              </th>
                              <th className="border border-gray-300 p-2 bg-gray-100">
                                Result
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredData.map(
                              (row: ScoringDataRow, index: number) => (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                  }
                                >
                                  <td className="border border-gray-300 p-2">
                                    {row.Points}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {row.Result}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : null;
            })
          )
        ) : (
          <p className="text-gray-500">
            Please select a discipline or enter a scoring point to see the data.
          </p>
        )}
      </div>
    </div>
  );
};

export default App;
