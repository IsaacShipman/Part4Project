import React, { useCallback } from 'react';
import { Box, Typography, Container, Alert, IconButton } from '@mui/material';
import { Build as BuildIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  PromptInputPanel,
  IntentParseDisplay,
  FlowCanvas,
  EndpointCards,
  GeneratedWorkflow,
  InterpretedParam
} from '../components/EndpointGenerator';
import { useEndpointGenerator } from '../components/EndpointGenerator/EndpointGeneratorContext';

const EndpointGeneratorWithContext: React.FC = () => {
  const { state, actions } = useEndpointGenerator();

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
        { from: "step-1", to: "step-2", map: "for each repo => owner=repo.owner.login, repo=repo.name" }
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
    actions.setLoading(true);
    actions.setLanguage(selectedLanguage);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real app, this would be an API call to your backend
    actions.setWorkflow(mockWorkflow);
    actions.setInterpretedParams(mockInterpretedParams);
    actions.setSelectedStep(mockWorkflow.steps[0]?.id || null);
    actions.setLoading(false);
  }, [actions]);

  const handleStepClick = useCallback((stepId: string) => {
    actions.setSelectedStep(stepId);
  }, [actions]);

  const handleRunRequest = useCallback((stepId: string) => {
    // In a real app, this would execute the API request
    console.log('Running request for step:', stepId);
    // Could open a dialog or navigate to the API request viewer
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
              Endpoint Generator
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: (theme) => theme.custom.colors.text.secondary,
                fontWeight: 400
              }}
            >
              Transform natural language into production-ready API workflows
            </Typography>
          </Box>
          
          {/* Clear state button */}
          {state.workflow && (
            <IconButton
              onClick={actions.clearState}
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

        {/* Restored state notification */}
        {state.hasRestoredState && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              backgroundColor: (theme) => `${theme.custom.colors.primary}10`,
              border: (theme) => `1px solid ${theme.custom.colors.primary}30`
            }}
            onClose={actions.dismissRestoredNotification}
          >
            Previous workflow restored from your last session
          </Alert>
        )}

        {/* Main Layout: 30% | 45% | 25% */}
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
          {/* Left Column - Prompt Input & Intent Parse */}
          <Box sx={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PromptInputPanel
              onGenerate={handleGenerate}
              isLoading={state.isLoading}
            />
            
            {state.workflow && (
              <IntentParseDisplay
                intent={state.workflow.intent}
                interpretedParams={state.interpretedParams}
                onParamChange={actions.updateParam}
              />
            )}
          </Box>

          {/* Center Column - Flow Canvas */}
          <Box sx={{ flex: '0 0 45%' }}>
            <FlowCanvas
              title={state.workflow?.title}
              description={state.workflow?.description}
              steps={state.workflow?.steps || []}
              dataFlow={state.workflow?.data_flow}
              metadata={state.workflow?.metadata}
              onNodeClick={handleStepClick}
            />
          </Box>

          {/* Right Column - Endpoint Cards */}
          <Box sx={{ flex: '0 0 25%', overflow: 'auto' }}>
            <EndpointCards
              steps={state.workflow?.steps || []}
              selectedStepId={state.selectedStepId || undefined}
              language={state.language}
              onRunRequest={handleRunRequest}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default EndpointGeneratorWithContext;
