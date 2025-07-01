import { Card, CardContent } from "../ui/card";

export default function ScrapeConfigurationsLoading() {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center text-muted-foreground">
          <p>Loading configurations...</p>
        </div>
      </CardContent>
    </Card>
  );
}
