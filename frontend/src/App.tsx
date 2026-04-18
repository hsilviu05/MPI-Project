import { BaseLayout } from "./components/layout/BaseLayout";
import { HomePage } from "./pages/HomePage";

export function App() {
  return (
    <BaseLayout>
      <HomePage />
    </BaseLayout>
  );
}
