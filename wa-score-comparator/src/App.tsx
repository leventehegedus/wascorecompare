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

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/merged.csv");
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csv = decoder.decode(result.value);

      Papa.parse(csv, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          if (Array.isArray(results.data)) {
            const transformedData = results.data.map((row: any) => {
              return {
                Points: Object.values(row)[0],
                Discipline: Object.values(row)[1],
                Result: Object.values(row)[2],
                Gender: Object.values(row)[3],
                Environment: Object.values(row)[4],
              };
            });

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

            setScoringData(groupedData);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    };

    fetchData();
  }, []);

  return (
    <div>
      {Object.keys(scoringData).map((discipline, index) => (
        <div key={index}>
          <h1>{discipline}</h1>
          {Object.keys(scoringData[discipline]).map((gender, index) => (
            <div key={index}>
              <h2>{gender}</h2>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px",
                        backgroundColor: "#f2f2f2",
                      }}
                    >
                      Points
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px",
                        backgroundColor: "#f2f2f2",
                      }}
                    >
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scoringData[discipline][gender].map((row, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {row.Points}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {row.Result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;
