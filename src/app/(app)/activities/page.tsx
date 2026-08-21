"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityList } from "@/features/activities/components/ActivityList";
import { CategoryList } from "@/features/categories/components/CategoryList";

export default function ActivitiesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <Tabs defaultValue="activities">
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
