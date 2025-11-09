
# Gemini Deep Research Assistant

The Gemini Deep Research Assistant is an advanced web application that leverages the power of the Google Gemini API to perform automated, multi-step, and source-grounded research on any given topic. It goes beyond simple Q&A by first authoring a custom research directive, creating a strategic plan, executing it with live search, and finally synthesizing the findings into a comprehensive, well-structured knowledge report.

![Screenshot of the Gemini Deep Research Assistant UI](https://i.imgur.com/gU9yS3k.png)

## Key Features

- **Meta-Prompting Workflow**: Instead of using a static prompt, the application first generates a custom, high-quality research directive tailored to the user's specific subject and notes using an "Inquiry Engine."
- **Automated Research Planning**: Based on the custom directive, the assistant generates a logical, step-by-step research plan.
- **Source-Grounded Execution**: Each step of the plan is executed using Gemini with Google Search grounding, ensuring the information is up-to-date and verifiable.
- **Deep Report Synthesis**: All collected data is synthesized by the powerful `gemini-2.5-pro` model (with Thinking Mode enabled) into a detailed, long-form analytical report in Markdown.
- **Interactive UI**: A clean, responsive interface allows users to input their research topic, monitor the multi-step progress in real-time, and view the final report.
- **Export Functionality**: The final report can be easily copied to the clipboard or downloaded as a `.md` file for offline use.
- **Prompt Modularity**: All prompts are externalized in a `/prompts` directory, allowing for easy tweaking and customization without touching the application code.

## How It Works: The Research Workflow

The application follows a sophisticated, multi-stage process to generate its reports:

1.  **Input**: The user provides a **Subject** to research and, optionally, **Special Notes or Considerations**. These notes can be simple instructions or a complex, custom research methodology.

2.  **Step 1: Author Research Directive**: The application uses the `prompts/inquiryEngine.txt` meta-prompt to instruct `gemini-2.5-pro` to author a comprehensive research directive tailored to the user's input. This directive sets the tone, scope, and rules for the entire research process.

3.  **Step 2: Generate Research Plan**: This newly authored directive is sent to `gemini-2.5-flash`, which returns a JSON array of 3-5 key research questions or sub-topics that form the research plan.

4.  **Step 3: Execute Research Steps**: The application iterates through each step of the plan. For each sub-topic, it calls `gemini-2.5-flash` with the `googleSearch` tool enabled. The prompt for this step includes the master directive to ensure the research adheres to principles like temporal awareness, conflict resolution, and source prioritization.

5.  **Step 4: Synthesize Knowledge Report**: All the collected summaries and sources from the research phase are aggregated. This complete dataset is then sent to `gemini-2.5-pro` with `thinkingConfig` enabled. A final, detailed prompt (`prompts/generatePersonaKnowledgeBase.txt`) instructs the model to synthesize this data into a structured, analytical report with inline citations and a "Works Cited" section.

6.  **Step 5: Display Report**: The final Markdown report is rendered in the user interface, with options to copy or download.

## Tech Stack

-   **Frontend**: React, TypeScript
-   **AI**: Google Gemini API (`@google/genai`)
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **Module Loading**: ES Modules with Import Maps (no build step required)

## Project Structure

```
.
├── components/
│   ├── ReportDisplay.tsx       # Renders the final Markdown report
│   ├── ResearchProgress.tsx    # Displays the current state of the research plan
│   └── TopicInput.tsx          # Initial user input form
├── prompts/
│   ├── executeResearchStep.txt # Prompt for executing a single research step
│   ├── generatePersonaKnowledgeBase.txt # Prompt for synthesizing the final report
│   ├── generateResearchPlan.txt  # Prompt for creating the research plan
│   └── inquiryEngine.txt       # Meta-prompt for authoring the research directive
├── services/
│   └── geminiService.ts        # Handles all communication with the Gemini API
├── types.ts                    # TypeScript type definitions and enums
├── App.tsx                     # Main application component, state management, and workflow logic
├── index.html                  # Main HTML file with dependencies
├── index.tsx                   # React entry point
├── metadata.json               # Application metadata
└── README.md                   # This file
```

## Getting Started

This application is designed to run in an environment that supports modern JavaScript and has access to the Google Gemini API.

**Prerequisites:**

-   A valid Google Gemini API key.
-   A local web server to serve the files.

**Running the Application:**

1.  Ensure the `API_KEY` is available as an environment variable (`process.env.API_KEY`) in the execution context. The application logic in `services/geminiService.ts` relies on this.
2.  Serve the project directory using a simple local web server. For example, using Python:
    ```bash
    python -m http.server
    ```
3.  Open your browser and navigate to the local server's address (e.g., `http://localhost:8000`).

## Customization

The core logic of the research process is driven by the prompts in the `/prompts` directory. To customize the application's behavior, you can modify these text files:

-   **`inquiryEngine.txt`**: Change this to alter how the initial research directive is created. This is the most impactful change you can make.
-   **`generateResearchPlan.txt`**: Tweak this to change the structure or number of steps in the research plan.
-   **`executeResearchStep.txt`**: Modify this to change how each individual research step is performed (e.g., change the desired summary length).
-   **`generatePersonaKnowledgeBase.txt`**: Edit this to change the final report's format, tone, or structure.
