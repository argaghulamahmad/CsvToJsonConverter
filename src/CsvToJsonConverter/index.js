import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Row,
  Col,
  message,
  List,
  Alert,
  Drawer,
  Tabs
} from "antd";
import { v4 as uuidv4 } from "uuid";

import {
  CopyOutlined,
  DeleteOutlined,
  SearchOutlined
} from "@ant-design/icons";

const { TextArea } = Input;

function CsvToJsonConverter() {
  const [csvText, setCsvText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [history, setHistory] = useState([]);
  const [inputError, setInputError] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const convertCsvToJson = () => {
    // Split the input CSV string into an array of lines
    const lines = csvText.split("\n");

    // Remove empty lines
    const nonEmptyLines = lines.filter((line) => line.trim() !== "");

    // Check if input is valid
    if (nonEmptyLines.length < 2 || nonEmptyLines[0].split(",").length < 1) {
      setInputError(true);
      return;
    }

    // Extract the column headers from the first line and convert to snakecase
    const headers = lines[0]
      .split(",")
      .map((header) => header.toLowerCase().replace(/ /g, "_"));

    // Create an empty array to store the JSON objects
    const jsonList = [];

    // Loop over the remaining lines and convert each to a JSON object
    for (let i = 1; i < nonEmptyLines.length; i++) {
      const values = lines[i].split(",");
      const obj = {};

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j];
      }

      jsonList.push(obj);
    }

    setJsonText(JSON.stringify(jsonList, null, 2));

    const newItem = {
      id: uuidv4(),
      name: "",
      csv: csvText,
      json: jsonList
    };
    setHistory([...history, newItem]);
    setInputError(false);

    navigator.clipboard.writeText(JSON.stringify(jsonList, null, 2));

    message.success("CSV converted to JSON and copied to clipboard!");
  };

  const handleShowHistory = () => {
    setHistoryVisible(true);
  };

  const handleHideHistory = () => {
    setHistoryVisible(false);
  };

  const handleEditHistoryItem = (id, newItem) => {
    setHistory(history.map((item) => (item.id === id ? newItem : item)));
  };

  const handleDeleteHistoryItem = (itemId) => {
    setHistory(history.filter((item) => item.id !== itemId));
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  return (
    <>
      <Row justify="center" align="middle" style={{ height: "100vh" }}>
        <Col span={20} style={{ padding: "2rem", backgroundColor: "#fff" }}>
          <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
            CSV to JSON Converter
          </h1>
          {inputError && (
            <Alert
              message="Invalid input"
              description={
                <>
                  The input CSV is invalid. Please make sure it has at least one
                  header and one row of data. Here's an example CSV file
                  structure:
                  <br />
                  <br />
                  <code>
                    date,product,quantity,revenue
                    <br />
                    2022-01-01,Widget A,10,100.00
                    <br />
                    2022-01-02,Widget B,5,75.00
                    <br />
                    2022-01-03,Widget A,8,80.00
                    <br />
                    2022-01-04,Widget C,3,45.00
                  </code>
                </>
              }
              type="warning"
              closable
              onClose={() => setInputError(false)}
              style={{ marginBottom: "1rem" }}
            />
          )}
          <TextArea
            placeholder="Enter CSV text here..."
            rows={10}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />
          <Button type="primary" onClick={convertCsvToJson} block>
            Convert
          </Button>
          <TextArea
            placeholder="JSON output will appear here..."
            rows={10}
            value={jsonText}
            readOnly
            style={{ marginTop: "1rem" }}
            disabled
          />
        </Col>
      </Row>
      <Drawer
        title="Conversion History"
        placement="right"
        open={historyVisible}
        onClose={handleHideHistory}
        width="60%"
      >
        <Tabs
          defaultActiveKey="1"
          centered
          items={[
            {
              label: `List`,
              key: "list",
              children: (
                <div>
                  <Input
                    placeholder="Search history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    suffix={<SearchOutlined />}
                    style={{ marginBottom: "1rem" }}
                  />
                  <List
                    dataSource={history.filter(
                      (item) =>
                        item.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        item.csv
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        JSON.stringify(item.json)
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )}
                    renderItem={(item) => (
                      <List.Item key={item.id}>
                        <div style={{ width: "100%" }}>
                          <h4>Title:</h4>
                          <Row gutter={[16, 16]}>
                            <Col span={24}>
                              <Input
                                defaultValue={item.name}
                                onChange={(e) => {
                                  handleEditHistoryItem(item.id, {
                                    ...item,
                                    name: e.target.value
                                  });
                                }}
                                onPressEnter={(e) =>
                                  handleEditHistoryItem(item.id, {
                                    ...item,
                                    name: e.target.value
                                  })
                                }
                                style={{ width: "100%" }}
                              />
                            </Col>
                          </Row>
                          <Row
                            gutter={[16, 16]}
                            style={{ marginTop: "1rem", marginBottom: "1rem" }}
                          >
                            <Col span={8}>
                              <div>
                                <h4>CSV:</h4>
                                <TextArea
                                  value={item.csv}
                                  readOnly
                                  autoSize={{ minRows: 5, maxRows: 10 }}
                                />
                              </div>
                            </Col>
                            <Col span={8}>
                              <div>
                                <h4>JSON:</h4>
                                <TextArea
                                  value={JSON.stringify(item.json, null, 2)}
                                  readOnly
                                  autoSize={{ minRows: 5, maxRows: 10 }}
                                />
                              </div>
                            </Col>
                            <Col span={8}>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column"
                                }}
                              >
                                {[
                                  <Button
                                    type="text"
                                    icon={<CopyOutlined />}
                                    onClick={() =>
                                      navigator.clipboard.writeText(item.csv)
                                    }
                                  >
                                    Copy CSV
                                  </Button>,
                                  <Button
                                    type="text"
                                    icon={<CopyOutlined />}
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        JSON.stringify(item.json, null, 2)
                                      )
                                    }
                                  >
                                    Copy JSON
                                  </Button>,
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleDeleteHistoryItem(item.id)
                                    }
                                  >
                                    Delete
                                  </Button>
                                ].map((action) => (
                                  <div style={{ margin: "8px 0" }}>
                                    {action}
                                  </div>
                                ))}
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              )
            },
            {
              label: `Json`,
              key: "json",
              children: (
                <div>
                  <TextArea
                    placeholder="JSON output will appear here..."
                    autoSize={{ minRows: 100, maxRows: 200 }}
                    value={JSON.stringify(history, null, 2)}
                    readOnly
                    style={{ marginTop: "1rem" }}
                  />
                </div>
              )
            }
          ]}
        />
      </Drawer>
      <Button
        type="primary"
        style={{ position: "fixed", bottom: "2rem", right: "2rem" }}
        onClick={handleShowHistory}
      >
        Show History
      </Button>
    </>
  );
}

export default CsvToJsonConverter;
