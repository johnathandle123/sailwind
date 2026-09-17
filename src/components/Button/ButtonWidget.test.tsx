import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ButtonWidget } from "./ButtonWidget";

const choices = {
  choiceLabels: ["Blank model", "From a template", "Import model"],
  choiceValues: ["blank", "template", "import"],
};

describe("ButtonWidget - default layout", () => {
  it("renders a plain button when menuLayout is omitted", () => {
    render(<ButtonWidget label="Save" />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).not.toHaveAttribute("aria-haspopup");
  });

  it("ignores MENU layout when no choices are supplied", () => {
    render(<ButtonWidget label="Save" menuLayout="MENU" />);
    expect(screen.getByRole("button", { name: "Save" })).not.toHaveAttribute("aria-haspopup");
  });
});

describe("ButtonWidget - MENU layout", () => {
  it("marks the trigger as opening a menu", () => {
    render(<ButtonWidget label="Create model" menuLayout="MENU" {...choices} />);
    const trigger = screen.getByRole("button", { name: "Create model" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the menu on click and lists every choice", async () => {
    render(<ButtonWidget label="Create model" menuLayout="MENU" {...choices} />);
    // Held onto because Radix hides outside content from the a11y tree while open
    const trigger = screen.getByRole("button", { name: "Create model" });
    await userEvent.click(trigger);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("passes the matching choiceValue to menuSaveInto", async () => {
    const menuSaveInto = vi.fn();
    render(
      <ButtonWidget label="Create model" menuLayout="MENU" {...choices} menuSaveInto={menuSaveInto} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "From a template" }));
    expect(menuSaveInto).toHaveBeenCalledWith("template");
  });

  it("falls back to saveInto when menuSaveInto is not provided", async () => {
    const saveInto = vi.fn();
    render(<ButtonWidget label="Create model" menuLayout="MENU" {...choices} saveInto={saveInto} />);
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Import model" }));
    expect(saveInto).toHaveBeenCalledWith("import");
  });

  it("falls back to the label when a choice has no value", async () => {
    const menuSaveInto = vi.fn();
    render(
      <ButtonWidget
        label="Actions"
        menuLayout="MENU"
        choiceLabels={["Duplicate"]}
        menuSaveInto={menuSaveInto}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Duplicate" }));
    expect(menuSaveInto).toHaveBeenCalledWith("Duplicate");
  });

  it("renders choice descriptions and disables the choices asked for", async () => {
    const menuSaveInto = vi.fn();
    render(
      <ButtonWidget
        label="Create model"
        menuLayout="MENU"
        {...choices}
        choiceDescriptions={["Start from scratch", "", ""]}
        choiceDisabled={[false, false, true]}
        menuSaveInto={menuSaveInto}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    expect(screen.getByText("Start from scratch")).toBeInTheDocument();

    const disabled = screen.getByRole("menuitem", { name: "Import model" });
    expect(disabled).toHaveAttribute("data-disabled");
    await userEvent.click(disabled);
    expect(menuSaveInto).not.toHaveBeenCalled();
  });

  it("shows a menu heading when menuLabel is set", async () => {
    render(
      <ButtonWidget label="Create model" menuLayout="MENU" menuLabel="Create" {...choices} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("is keyboard operable: Enter opens on the first choice, arrows move, Enter selects", async () => {
    const menuSaveInto = vi.fn();
    render(
      <ButtonWidget label="Create model" menuLayout="MENU" {...choices} menuSaveInto={menuSaveInto} />
    );
    screen.getByRole("button", { name: "Create model" }).focus();
    await userEvent.keyboard("{Enter}");

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Blank model" })).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(menuSaveInto).toHaveBeenCalledWith("template");
  });

  it("closes on Escape", async () => {
    render(<ButtonWidget label="Create model" menuLayout="MENU" {...choices} />);
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    render(<ButtonWidget label="Create model" menuLayout="MENU" disabled={true} {...choices} />);
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("ButtonWidget - SPLIT layout", () => {
  it("renders a primary action plus a separately labelled caret", () => {
    render(<ButtonWidget label="Create model" menuLayout="SPLIT" {...choices} />);
    expect(screen.getByRole("button", { name: "Create model" })).toBeInTheDocument();
    const caret = screen.getByRole("button", { name: "More Create model options" });
    expect(caret).toHaveAttribute("aria-haspopup", "menu");
  });

  it("runs the primary action without opening the menu", async () => {
    const saveInto = vi.fn();
    render(
      <ButtonWidget label="Create model" menuLayout="SPLIT" {...choices} saveInto={saveInto} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    expect(saveInto).toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the menu from the caret only", async () => {
    const menuSaveInto = vi.fn();
    render(
      <ButtonWidget
        label="Create model"
        menuLayout="SPLIT"
        {...choices}
        menuSaveInto={menuSaveInto}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "More Create model options" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "Blank model" }));
    expect(menuSaveInto).toHaveBeenCalledWith("blank");
  });

  it("uses menuAccessibilityText for the caret when provided", () => {
    render(
      <ButtonWidget
        label="Create model"
        menuLayout="SPLIT"
        menuAccessibilityText="Other ways to create a model"
        {...choices}
      />
    );
    expect(
      screen.getByRole("button", { name: "Other ways to create a model" })
    ).toBeInTheDocument();
  });
});

describe("ButtonWidget - menu styling matches DropdownField", () => {
  it("uses the same panel treatment as the dropdown option list", async () => {
    render(<ButtonWidget label="Create model" menuLayout="MENU" {...choices} />);
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    const panel = screen.getByRole("menu");
    ["bg-white", "border-gray-300", "rounded-sm", "shadow-lg", "max-h-60", "overflow-hidden"].forEach(
      (cls) => expect(panel.className).toContain(cls)
    );
  });

  it("uses the same option treatment as the dropdown choices", async () => {
    render(<ButtonWidget label="Create model" menuLayout="MENU" {...choices} />);
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    const item = screen.getByRole("menuitem", { name: "Blank model" });
    ["w-full", "px-3", "py-2", "text-left", "text-base", "hover:bg-gray-100"].forEach((cls) =>
      expect(item.className).toContain(cls)
    );
  });

  it("scrolls a long choice list rather than growing past the panel", async () => {
    render(
      <ButtonWidget
        label="Actions"
        menuLayout="MENU"
        choiceLabels={Array.from({ length: 30 }, (_, i) => `Choice ${i + 1}`)}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    const scroller = screen.getByRole("menu").firstElementChild as HTMLElement;
    expect(scroller.className).toContain("overflow-y-auto");
    expect(scroller.className).toContain("max-h-48");
  });
});

describe("ButtonWidget - menu alignment", () => {
  it.each([
    ["START", "start"],
    ["CENTER", "center"],
    ["END", "end"],
  ] as const)("maps menuAlign=%s to Radix align=%s", async (sailAlign, radixAlign) => {
    render(
      <ButtonWidget label="Create model" menuLayout="MENU" menuAlign={sailAlign} {...choices} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Create model" }));
    expect(screen.getByRole("menu")).toHaveAttribute("data-align", radixAlign);
  });
});
