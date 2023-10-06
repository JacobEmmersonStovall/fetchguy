import React, { useState, useEffect } from "react";
import { Box, Text, render } from "ink";

export interface AssertStatus {
  title: string;
  failureMessage: string;
  statusColor: "green" | "red" | "blue";
}

export interface TestStatus {
  title: string;
  statusColor: "green" | "red" | "blue" | "yellow";
  assertStatuses: AssertStatus[];
}

export interface Assert {
  title: string;
  type: "HEADER" | "BODY" | "STATUS_CODE";
  comparison: "EQUAL";
  propDrilldown: string[];
  value: number | string | boolean | null | undefined;
}

export interface RequestTest {
  title: string;
  url: string;
  fetchOptions: RequestInit;
  asserts: Assert[];
}

export const TestRunner = (tests: RequestTest[]) => {
  render(<TestRunnerOutput tests={tests} />);
};

const runTests = async (
  tests: RequestTest[],
  [_testsPassed, setTestsPassed]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ],
  [_testsFailed, setTestsFailed]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ],
  [_totalTests, setTestsLeft]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ],
  [testStatus, setTestsStatus]: [
    TestStatus[],
    React.Dispatch<React.SetStateAction<TestStatus[]>>
  ]
) => {
  let totalTests = _totalTests;
  let testsPassed = _testsPassed;
  let testsFailed = _testsFailed;
  for (let i = 0; i < tests.length; i++) {
    let currentTest = tests[i];
    let tempStatuses = [...testStatus];

    // Start showing test as running
    tempStatuses[i].statusColor = "yellow";
    setTestsStatus(tempStatuses);

    // Make the request
    let resp = await fetch(currentTest.url, currentTest.fetchOptions);
    let body = await resp.json();
    let headers = resp.headers;
    let statusCode = resp.status;

    for (let j = 0; j < currentTest.asserts.length; j++) {
      tempStatuses = [...testStatus];
      const failTest = (msg: string) => {
        tempStatuses[i].assertStatuses[j].statusColor = "red";
        tempStatuses[i].assertStatuses[j].failureMessage = msg;
        setTestsStatus(tempStatuses);
      };
      const passTest = () => {
        tempStatuses[i].assertStatuses[j].statusColor = "green";
        setTestsStatus(tempStatuses);
      };
      let currentAssert = currentTest.asserts[j];
      if (currentAssert.comparison === "EQUAL") {
        if (currentAssert.type === "BODY") {
          let result = currentAssert.propDrilldown.reduce(
            (prev, curr) => prev[curr] || {},
            body
          );
          if (result === currentAssert.value) {
            passTest();
          } else {
            failTest(`Expected ${currentAssert.value} received ${result}`);
          }
        } else if (currentAssert.type === "HEADER") {
          let result = headers.get(currentAssert.propDrilldown[0]);
          if (result === currentAssert.value) {
            passTest();
          } else {
            failTest(`Expected ${currentAssert.value} received ${result}`);
          }
        } else if (currentAssert.type === "STATUS_CODE") {
          if (statusCode === currentAssert.value) {
            passTest();
          } else {
            failTest(`Expected ${currentAssert.value} received ${statusCode}`);
          }
        } else {
          failTest("Invalid Assert type");
        }
      } else {
        failTest("Invalid Assert comparison type");
      }
    }

    tempStatuses = [...testStatus];
    let finalTestResult = tempStatuses[i].assertStatuses
      .map((ele) => ele.statusColor === "green")
      .reduce((prev, curr) => prev && curr, true);
    if (finalTestResult) {
      tempStatuses[i].statusColor = "green";
      totalTests -= 1;
      testsPassed += 1;
      setTestsStatus(tempStatuses);
      setTestsLeft(totalTests);
      setTestsPassed(testsPassed);
    } else {
      tempStatuses[i].statusColor = "red";
      totalTests -= 1;
      testsFailed += 1;
      setTestsStatus(tempStatuses);
      setTestsLeft(totalTests);
      setTestsFailed(testsFailed);
    }
  }
};

const TestRunnerOutput = ({ tests }: { tests: RequestTest[] }) => {
  const [testsPassed, setTestsPassed] = useState(0);
  const [testsFailed, setTestsFailed] = useState(0);
  const [totalTests, setTestsLeft] = useState(tests.length);
  const [testStatus, setTestsStatus] = useState<TestStatus[]>(
    tests.map<TestStatus>((ele: RequestTest) => {
      return {
        title: ele.title,
        statusColor: "blue",
        assertStatuses: ele.asserts.map<AssertStatus>((innerEle) => {
          return {
            title: innerEle.title,
            statusColor: "blue",
            failureMessage: "",
          };
        }),
      };
    })
  );

  useEffect(() => {
    runTests(
      tests,
      [testsPassed, setTestsPassed],
      [testsFailed, setTestsFailed],
      [totalTests, setTestsLeft],
      [testStatus, setTestsStatus]
    );
  }, []);

  return (
    <>
      {testStatus.map((ele) => {
        return (
          <Box key={ele.title} flexDirection="column">
            <Box key={ele.title + "-box"} margin={0}>
              <Text key={ele.title + "-text"} color={ele.statusColor}>
                {ele.title}
              </Text>
            </Box>
            {ele.assertStatuses.map((innerEle) => (
              <Box
                key={ele.title + "-" + innerEle.title + "-box"}
                marginLeft={5}
              >
                <Text
                  key={ele.title + "-" + innerEle.title}
                  color={innerEle.statusColor}
                >
                  {innerEle.title +
                    (!!innerEle.failureMessage
                      ? " - " + innerEle.failureMessage
                      : "")}
                </Text>
              </Box>
            ))}
          </Box>
        );
      })}
      <Text>============================================</Text>
      <Text color="green">Tests Passed: {testsPassed}</Text>
      <Text color="red">Tests Failed: {testsFailed}</Text>
      <Text color="blue">Tests Left: {totalTests}</Text>
    </>
  );
};
