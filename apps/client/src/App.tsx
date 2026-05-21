import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ChatSocketProvider } from './websocket/ChatSocketProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatSocketProvider>
        <RouterProvider router={router} />
        <ToastContainer theme="dark" position="bottom-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </ChatSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
