# n8n Integration Strategy for CIAgent

Integrating **n8n** with CIAgent will allow for more complex automation workflows, external integrations, and delegated scraping. Below are the key ways n8n can be utilized in this project.

## 1. Delegated Scraping & Monitoring
Instead of using internal `playwright` instances for everything, n8n can handle scheduled monitoring of competitor websites.

- **Trigger:** Schedule (e.g., every 8 hours) or HTTP Webhook from CIAgent Backend.
- **Action:** 
    - Use the **HTTP Request** node to fetch page content.
    - Use **HTML Extract** node to parse specific sections.
    - Post findings back to the CIAgent `reports` or `scrape` endpoints.
- **Benefit:** Offloads high-memory browser tasks from your main backend.

## 2. Multi-Channel Notifications
Expand the `notifier.py` functionality by routing alerts through n8n.

- **Trigger:** Webhook from CIAgent when a high-severity change is detected.
- **Flow:**
    - **Filter:** Only process "High" or "Medium" severity.
    - **Distribute:** 
        - Send to **Discord** via Webhook node.
        - Send to **Microsoft Teams** via Teams node.
        - Create a **Jira** or **Trello** ticket for the product team to review the competitor change.
- **Benefit:** Easier to add new notification channels without changing backend code.

## 3. Weekly Intelligence Summaries
Create a "Digest" workflow.

- **Trigger:** Weekly cron job in n8n.
- **Action:**
    - **Fetch:** Get all reports from the last 7 days via the CIAgent API.
    - **Aggregate:** Pass reports to an AI node (OpenAI/Anthropic) in n8n to create a "Weekly Competitive Landscape" summary.
    - **Deliver:** Email the PDF or Slack the summary to the user.
- **Benefit:** Provides higher-level value beyond individual alerts.

## 4. Competitive Social Monitoring
Monitor things the backend doesn't currently handle (like social media).

- **Flow:**
    - Monitor Twitter/LinkedIn/Reddit for competitor mentions.
    - Categorize sentiment.
    - Push significant negative/positive sentiment spikes into the CIAgent "Signals" dashboard.

---

### Suggested n8n Workflow Structure
1. **Webhook Node**: Receives data from CIAgent.
2. **Filter Node**: Checks severity or type.
3. **AI/LLM Node**: Formats the message or extracts specific insights.
4. **Output Nodes**: Slack, Discord, Email, or Jira.
