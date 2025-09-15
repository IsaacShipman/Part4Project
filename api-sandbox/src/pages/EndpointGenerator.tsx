import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Container, Alert, IconButton } from '@mui/material';
import { Build as BuildIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  PromptInputPanel,
  IntentParseDisplay,
  FlowCanvas,
  EndpointCardsPanel,
  GeneratedWorkflow,
  GeneratorState,
  InterpretedParam
} from '../components/EndpointGenerator';
import {
  saveEndpointGeneratorState,
  loadEndpointGeneratorState,
  clearEndpointGeneratorState,
  hasPersistedState
} from '../components/EndpointGenerator/endpointGeneratorStorage';

const EndpointGenerator: React.FC = () => {
  const [state, setState] = useState<GeneratorState>({
    isLoading: false,
    workflow: null,
    selectedStepId: null,
    interpretedParams: []
  });

  const [language, setLanguage] = useState<string>('typescript');
  const [hasRestoredState, setHasRestoredState] = useState<boolean>(false);

  // Load persisted state on component mount
  useEffect(() => {
    const persistedState = loadEndpointGeneratorState();
    if (persistedState) {
      setState(prev => ({
        ...prev,
        workflow: persistedState.workflow,
        selectedStepId: persistedState.selectedStepId,
        interpretedParams: persistedState.interpretedParams
      }));
      setLanguage(persistedState.language);
      setHasRestoredState(true);
    }
  }, []);

  // Save state whenever it changes (debounced)
  useEffect(() => {
    if (state.workflow && !state.isLoading) {
      const timeoutId = setTimeout(() => {
        saveEndpointGeneratorState(
          state.workflow,
          state.selectedStepId,
          state.interpretedParams,
          language
        );
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [state.workflow, state.selectedStepId, state.interpretedParams, language, state.isLoading]);

  // Mock data for demonstration - in a real app this would come from an API
  const mockWorkflow: GeneratedWorkflow = {
    title: "List user repositories + latest commit",
    description: "High-level: list public repos for a user, returning name, desc, stargazers_count and latest commit sha.",
    intent: {
      raw: "Get repos for user and latest commit",
      parsed: ["list_repos", "get_latest_commit"],
      confidence: 0.93
    },
    steps: [
      {
        id: "step-1",
        name: "List repos",
        description: "List public repositories for a given user",
        ai_guidance: "Start by fetching all public repositories for the specified user. This will give you a list of repositories with their basic information including names, descriptions, and star counts. You'll need the repository names and owner information for the next step.",
        endpoint: {
          method: "GET",
          url_template: "https://api.github.com/users/{username}/repos",
          path_params: [
            { name: "username", type: "string", required: true, example: "octocat" }
          ],
          query_params: [
            { name: "per_page", type: "integer", required: false, example: 30 },
            { name: "page", type: "integer", required: false, example: 1 }
          ],
          headers: [
            { name: "Accept", value: "application/vnd.github.v3+json" },
            { name: "Authorization", value: "token {GITHUB_TOKEN}", required: false }
          ]
        },
        pagination: { type: "link-header", note: "use Link header for next page" },
        example_request: {
          curl: "curl -H 'Accept: application/vnd.github.v3+json' https://api.github.com/users/octocat/repos"
        },
        example_response: { 
          mock: [{ 
            id: 129, 
            name: "hello-world", 
            stargazers_count: 42,
            owner: { login: "octocat" }
          }] 
        },
        notes: "Public endpoint, pagination required for >30 repos",
        confidence: 0.97
      },
      {
        id: "step-2",
        name: "Latest commit per repo",
        description: "For each repo, fetch the latest commit on default branch",
        ai_guidance: "For each repository from step 1, make a separate API call to get the latest commit. Use the owner login and repository name from the previous response. Set per_page=1 to get only the most recent commit, which will include the commit SHA and message.",
        endpoint: {
          method: "GET",
          url_template: "https://api.github.com/repos/{owner}/{repo}/commits",
          path_params: [
            { name: "owner", type: "string", required: true, example: "octocat" },
            { name: "repo", type: "string", required: true, example: "hello-world" }
          ],
          query_params: [
            { name: "per_page", type: "integer", required: false, example: 1 }
          ],
          headers: [
            { name: "Accept", value: "application/vnd.github.v3+json" }
          ]
        },
        example_request: { 
          curl: "curl -H 'Accept: application/vnd.github.v3+json' https://api.github.com/repos/octocat/hello-world/commits?per_page=1" 
        },
        example_response: { 
          mock: [{ 
            sha: "abc123", 
            commit: { message: "fix bug" } 
          }] 
        },
        confidence: 0.94
      }
    ],
    data_flow: {
      edges: [
        { 
          from: "step-1", 
          to: "step-2", 
          map: "For each repo: owner = repo.owner.login, repo = repo.name" 
        }
      ]
    },
    metadata: {
      estimated_calls_per_execution: 2,
      auth: { type: "oauth2", scopes: ["repo"] },
      source_docs: [
        { 
          url: "https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user", 
          snippet: "List public repositories for the specified user." 
        }
      ],
      generated_at: new Date().toISOString()
    }
  };

  const mockInterpretedParams: InterpretedParam[] = [
    { name: "username", value: "octocat", type: "string", editable: true },
    { name: "include_commits", value: "true", type: "boolean", editable: true }
  ];

  const handleGenerate = useCallback(async (prompt: string, authMethod: string, selectedLanguage: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    setLanguage(selectedLanguage);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real app, this would be an API call to your backend
    setState(prev => ({
      ...prev,
      isLoading: false,
      workflow: mockWorkflow,
      interpretedParams: mockInterpretedParams,
      selectedStepId: mockWorkflow.steps[0]?.id || null
    }));
  }, []);

  const handleParamChange = useCallback((paramName: string, newValue: string) => {
    setState(prev => ({
      ...prev,
      interpretedParams: prev.interpretedParams.map(param =>
        param.name === paramName ? { ...param, value: newValue } : param
      )
    }));
  }, []);

  const handleStepClick = useCallback((stepId: string) => {
    setState(prev => ({ ...prev, selectedStepId: stepId }));
  }, []);

  const handleRunRequest = useCallback((stepId: string) => {
    // In a real app, this would execute the API request
    console.log('Running request for step:', stepId);
    // Could open a dialog or navigate to the API request viewer
  }, []);

  const handleClearState = useCallback(() => {
    clearEndpointGeneratorState();
    setState({
      isLoading: false,
      workflow: null,
      selectedStepId: null,
      interpretedParams: []
    });
    setLanguage('typescript');
    setHasRestoredState(false);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: '72px', // Account for AppBar height
        background: (theme) => theme.custom.colors.background.gradient,
        position: 'relative'
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ py: 4, px: 20 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: (theme) => `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.accent} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3,
              boxShadow: (theme) => `0 8px 32px ${theme.custom.colors.primary}30`
            }}
          >
            <BuildIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: (theme) => theme.custom.colors.text.primary,
                mb: 1
              }}
            >
              Endpoint Explorer
            </Typography>
          
          </Box>
          
          {/* Clear state button */}
          {(state.workflow || hasPersistedState()) && (
            <IconButton
              onClick={handleClearState}
              sx={{
                color: (theme) => theme.custom.colors.text.secondary,
                '&:hover': {
                  color: (theme) => theme.custom.colors.primary,
                  backgroundColor: (theme) => `${theme.custom.colors.primary}10`
                }
              }}
              title="Clear saved workflow"
            >
              <RefreshIcon />
            </IconButton>
          )}
        </Box>

     

        {/* Main Layout widened: 26% | 49% | 25% */}
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 220px)' }}>
          {/* Left Column */}
          <Box sx={{ flex: '1 1 26%', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <PromptInputPanel
              onGenerate={handleGenerate}
              isLoading={state.isLoading}
            />
            
            {state.workflow && (
              <IntentParseDisplay
                intent={state.workflow.intent}
                interpretedParams={state.interpretedParams}
                onParamChange={handleParamChange}
              />
            )}
          </Box>

          {/* Center Column */}
          <Box sx={{ flex: '1 1 49%', minWidth: 560 }}>
            <FlowCanvas
              title={state.workflow?.title}
              description={state.workflow?.description}
              steps={state.workflow?.steps || []}
              dataFlow={state.workflow?.data_flow}
              metadata={state.workflow?.metadata}
              onNodeClick={handleStepClick}
            />
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: '1 1 25%', minWidth: 380 }}>
            <EndpointCardsPanel
              steps={state.workflow?.steps || []}
              selectedStepId={state.selectedStepId || undefined}
              language={language}
              onRunRequest={handleRunRequest}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default EndpointGenerator;
