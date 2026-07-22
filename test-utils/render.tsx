import { MantineProvider } from '@mantine/core';
import { render as testingLibraryRender } from '@testing-library/react';
import { ProjectModalProvider } from '../components/InkPaper/ProjectModal';
import { theme } from '../theme';

export function render(ui: React.ReactNode) {
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MantineProvider theme={theme} env="test">
        <ProjectModalProvider>{children}</ProjectModalProvider>
      </MantineProvider>
    ),
  });
}
