import EventCategoriesManager from "./components/EventCategoriesManager";

export default function EventCategoriesPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 space-y-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Event categories
        </h1>
        <p className="text-sm text-muted-foreground">
          These are the options publishers pick from when creating an event.
          Only admins can change them.
        </p>
      </div>
      <EventCategoriesManager />
    </div>
  );
}