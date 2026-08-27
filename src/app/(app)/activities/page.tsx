"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityList } from "@/features/activities/components/ActivityList";
import { CategoryList } from "@/features/categories/components/CategoryList";

export default function ActivitiesPage() {
  return (
    <Suspense fallback={null}>
      <ActivitiesPageContent />
    </Suspense>
  );
}

function ActivitiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Deep-linkable so other screens (e.g. the dashboard's getting-started checklist) can
  // point straight at the Categories tab via /activities?tab=categories.
  const tab = searchParams.get("tab") === "categories" ? "categories" : "activities";

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <Tabs value={tab} onValueChange={(value) => router.replace(`/activities?tab=${value}`)}>
        <TabsList>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="activities" className="mt-4">
          <ActivityList />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoryList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
