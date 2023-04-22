import { useState } from 'react'
import { ThemeProvider } from 'styled-components'

import { StyledPrimaryButton, StyledSecondaryButton } from './styles'
import { GlobalStyles } from './globalTheme'

import useTheme from './useTheme'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />

      <div>
        <h1>Mirrorful + styled components + Vite + React</h1>
        <StyledPrimaryButton onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </StyledPrimaryButton>
        <StyledSecondaryButton onClick={toggleTheme}>
          toggle theme
        </StyledSecondaryButton>
        <p>
          Theses buttons are styled with styled components which uses the theme
          generated by Mirrorful.
        </p>
      </div>
    </ThemeProvider>
  )
}

export default App
