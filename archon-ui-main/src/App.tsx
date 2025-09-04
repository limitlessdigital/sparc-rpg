import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CharacterCreationPage from './pages/sparc/CharacterCreationPage'

// Create a query client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Default route redirects to character creation for now */}
            <Route path="/" element={<Navigate to="/create-character" replace />} />
            
            {/* Character Creation */}
            <Route 
              path="/create-character" 
              element={
                <CharacterCreationPage 
                  onCharacterCreated={(character) => {
                    console.log('Character created:', character)
                    // TODO: Navigate to game session or character list
                  }}
                  onCancel={() => {
                    console.log('Character creation cancelled')
                    // TODO: Navigate to main menu or character list
                  }}
                />
              } 
            />
            
            {/* TODO: Add more routes */}
            {/* <Route path="/characters" element={<CharacterListPage />} /> */}
            {/* <Route path="/game/:sessionId" element={<GameSessionPage />} /> */}
            {/* <Route path="/seer/dashboard" element={<SeerDashboardPage />} /> */}
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App