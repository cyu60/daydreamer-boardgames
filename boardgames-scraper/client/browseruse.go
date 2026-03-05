package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	BaseURL        = "https://api.browser-use.com/api/v2"
	DefaultTimeout = 30 * time.Second
)

type Client struct {
	apiKey     string
	httpClient *http.Client
}

type Session struct {
	ID      string `json:"id"`
	Status  string `json:"status"`
	LiveURL string `json:"liveUrl,omitempty"`
}

type Task struct {
	ID        string `json:"id"`
	SessionID string `json:"sessionId"`
	Status    string `json:"status"`
	Output    string `json:"output,omitempty"`
}

type TaskStatus struct {
	Status      string `json:"status"`
	Output      string `json:"output,omitempty"`
	Result      string `json:"result,omitempty"`
	FinalResult string `json:"final_result,omitempty"`
}

func New(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: DefaultTimeout,
		},
	}
}

func (c *Client) doRequest(method, path string, body interface{}) ([]byte, error) {
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequest(method, BaseURL+path, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("X-Browser-Use-API-Key", c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

func (c *Client) CreateSession(profileID string) (*Session, error) {
	reqBody := map[string]interface{}{
		"keepAlive": true,
	}
	if profileID != "" {
		reqBody["profile_id"] = profileID
	}
	body, err := c.doRequest("POST", "/sessions", reqBody)
	if err != nil {
		return nil, err
	}

	var session Session
	if err := json.Unmarshal(body, &session); err != nil {
		return nil, fmt.Errorf("failed to parse session: %w", err)
	}

	return &session, nil
}

func (c *Client) CreateTask(sessionID, task string) (*Task, error) {
	body, err := c.doRequest("POST", "/tasks", map[string]interface{}{
		"task":       task,
		"session_id": sessionID,
	})
	if err != nil {
		return nil, err
	}

	var t Task
	if err := json.Unmarshal(body, &t); err != nil {
		return nil, fmt.Errorf("failed to parse task: %w", err)
	}

	return &t, nil
}

func (c *Client) GetTaskStatus(taskID string) (*TaskStatus, error) {
	body, err := c.doRequest("GET", "/tasks/"+taskID+"/status", nil)
	if err != nil {
		return nil, err
	}

	var status TaskStatus
	if err := json.Unmarshal(body, &status); err != nil {
		return nil, fmt.Errorf("failed to parse status: %w", err)
	}

	return &status, nil
}

func (c *Client) GetTask(taskID string) (*TaskStatus, error) {
	body, err := c.doRequest("GET", "/tasks/"+taskID, nil)
	if err != nil {
		return nil, err
	}

	var task TaskStatus
	if err := json.Unmarshal(body, &task); err != nil {
		return nil, fmt.Errorf("failed to parse task: %w", err)
	}

	return &task, nil
}

func (c *Client) WaitForTask(taskID string, callback func(status string)) (*TaskStatus, error) {
	for {
		status, err := c.GetTaskStatus(taskID)
		if err != nil {
			return nil, err
		}

		if callback != nil {
			callback(status.Status)
		}

		switch status.Status {
		case "completed", "finished", "failed", "stopped":
			return c.GetTask(taskID)
		}

		time.Sleep(2 * time.Second)
	}
}

func (c *Client) CloseSession(sessionID string) error {
	_, err := c.doRequest("DELETE", "/sessions/"+sessionID, nil)
	return err
}
