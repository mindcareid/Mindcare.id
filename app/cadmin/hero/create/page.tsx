import HeroForm from "../components/HeroForm";

export default function CreateHeroPage() {
  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8">
      <div className="mb-6 space-y-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Add hero slide
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload an image. Alt text and the button are optional.
        </p>
      </div>

      <HeroForm />
    </div>
  );
}
