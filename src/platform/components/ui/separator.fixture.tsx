import { Separator } from '@/platform/components/ui/separator';
function Default() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm leading-none font-medium">BaseUI Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator />
      <div className="flex gap-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  );
}

export default {
  Default,
};
