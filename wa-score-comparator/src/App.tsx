import React, { useState, useEffect } from "react";

enum Gender {
  Male = "M",
  Female = "F",
}

interface ScoringDataRow {
  Points: number;
  Discipline: string;
  Result: string;
  Gender: Gender;
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
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [inputPoints, setInputPoints] = useState<number | "">("");

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/data_men.json");
      const data: ScoringDataRow[] = await response.json();

      console.log("Parsed Data:", data); // Log the parsed data

      const groupedData: GroupedData = data.reduce((acc, row) => {
        const discipline = row.Discipline.toString();
        const gender = row.Gender;

        if (!acc[discipline]) {
          acc[discipline] = { Male: [], Female: [] };
        }

        if (gender === Gender.Male) {
          acc[discipline].Male.push(row);
        } else if (gender === Gender.Female) {
          acc[discipline].Female.push(row);
        }

        return acc;
      }, {} as GroupedData);

      console.log("Grouped Data:", groupedData); // Log the grouped data

      setScoringData(groupedData);
    };

    fetchData();
  }, []);

  const handleDisciplineClick = (discipline: string) => {
    setSelectedDisciplines((prevSelected) =>
      prevSelected.includes(discipline)
        ? prevSelected.filter((d) => d !== discipline)
        : [...prevSelected, discipline]
    );
  };

  const handlePointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      event.target.value === "" ? "" : parseInt(event.target.value, 10);
    if (value === "" || (value >= 1 && value <= 1400)) {
      setInputPoints(value);
    }
  };

  const shouldShowTables = selectedDisciplines.length > 0 || inputPoints !== "";

  const disciplineOptions = Object.keys(scoringData);

  return (
    <div className="p-6 text-black bg-white">
      <div className="flex gap-4 mb-6 flex-wrap">
        {disciplineOptions.map((discipline) => (
          <button
            key={discipline}
            onClick={() => handleDisciplineClick(discipline)}
            className={`p-2 border rounded ${
              selectedDisciplines.includes(discipline)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {discipline}
          </button>
        ))}

        <input
          type="number"
          value={inputPoints}
          onChange={handlePointsChange}
          placeholder="Enter points (1-1400)"
          min="1"
          max="1400"
          className="p-2 border border-gray-300 rounded w-full text-black bg-white"
        />
      </div>

      <div>
        {shouldShowTables ? (
          selectedDisciplines.length > 0 ? (
            selectedDisciplines.map((selectedDiscipline) => (
              <div key={selectedDiscipline}>
                <h1 className="text-2xl font-bold mb-4">
                  {selectedDiscipline}
                </h1>
                {Object.keys(scoringData[selectedDiscipline]).map(
                  (gender, index) => {
                    const filteredData = scoringData[selectedDiscipline][
                      gender as keyof typeof Gender
                    ]
                      .filter(
                        (row) =>
                          inputPoints === "" || row.Points === inputPoints
                      )
                      .sort((a, b) => b.Points - a.Points);

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
            ))
          ) : (
            Object.keys(scoringData).map((discipline) => {
              const hasData = Object.keys(scoringData[discipline]).some(
                (gender) => {
                  return (
                    scoringData[discipline][
                      gender as keyof typeof Gender
                    ].filter(
                      (row) => inputPoints === "" || row.Points === inputPoints
                    ).length > 0
                  );
                }
              );

              return hasData ? (
                <div key={discipline} className="mb-6">
                  <h1 className="text-2xl font-bold mb-4">{discipline}</h1>
                  {Object.keys(scoringData[discipline]).map((gender, index) => {
                    const filteredData = scoringData[discipline][
                      gender as keyof typeof Gender
                    ]
                      .filter(
                        (row) =>
                          inputPoints === "" || row.Points === inputPoints
                      )
                      .sort((a, b) => b.Points - a.Points);

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
