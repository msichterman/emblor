import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Command, CommandList, CommandItem, CommandGroup, CommandEmpty } from '../ui/command';
import { type Tag as TagType } from './tag-input';
import { cn } from '../utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popoever';
import { Button } from '../ui/button';

type AutocompleteProps = {
  tags: TagType[];
  setTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  autocompleteOptions: TagType[];
  maxTags?: number;
  onTagAdd?: (tag: string) => void;
  allowDuplicates: boolean;
  children: React.ReactNode;
  inlineTags?: boolean;
};

export const Autocomplete: React.FC<AutocompleteProps> = ({
  tags,
  setTags,
  autocompleteOptions,
  maxTags,
  onTagAdd,
  allowDuplicates,
  inlineTags,
  children,
}) => {
  const triggerContainerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [popoverWidth, setPopoverWidth] = useState<number>(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [popooverContentTop, setPopoverContentTop] = useState<number>(0);

  // Dynamically calculate the top position for the popover content
  useEffect(() => {
    if (!triggerContainerRef.current || !triggerRef.current) return;
    setPopoverContentTop(
      triggerContainerRef.current?.getBoundingClientRect().bottom - triggerRef.current?.getBoundingClientRect().bottom,
    );
  }, [tags]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open && triggerContainerRef.current) {
        const { width } = triggerContainerRef.current.getBoundingClientRect();
        setPopoverWidth(width);
      }

      if (open) {
        inputRef.current?.focus();
        setIsPopoverOpen(open);
      }
    },
    [inputFocused],
  );

  const handleInputFocus = () => {
    // Only set inputFocused to true if the popover is already open.
    // This will prevent the popover from opening due to an input focus if it was initially closed.
    if (isPopoverOpen) {
      setInputFocused(true);
    }

    const userOnFocus = (children as React.ReactElement<any>).props.onFocus;
    if (userOnFocus) userOnFocus(event);
  };

  const handleInputBlur = () => {
    setInputFocused(false);

    // Allow the popover to close if no other interactions keep it open
    if (!isPopoverOpen) {
      setIsPopoverOpen(false);
    }

    const userOnBlur = (children as React.ReactElement<any>).props.onBlur;
    if (userOnBlur) userOnBlur(event);
  };

  const toggleTag = (option: TagType) => {
    // Check if the tag already exists in the array
    const index = tags.findIndex((tag) => tag.text === option.text);

    if (index >= 0) {
      // Tag exists, remove it
      const newTags = tags.filter((_, i) => i !== index);
      setTags(newTags);
      console.log('newTags', newTags);
    } else {
      // Tag doesn't exist, add it if allowed
      if (!allowDuplicates && tags.some((tag) => tag.text === option.text)) {
        // If duplicates aren't allowed and a tag with the same text exists, do nothing
        return;
      }
      console.log('option', option);

      // Add the tag if it doesn't exceed max tags, if applicable
      if (!maxTags || tags.length < maxTags) {
        setTags([...tags, option]);
        if (onTagAdd) {
          onTagAdd(option.text);
        }
      }
    }
  };

  return (
    <Command className="w-full h-full">
      <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
        <div
          className="relative h-full flex items-center rounded-md border border-input bg-transparent pr-3"
          ref={triggerContainerRef}
        >
          {React.cloneElement(children as React.ReactElement<any>, {
            onFocus: handleInputFocus,
            onBlur: handleInputBlur,
            ref: inputRef,
          })}
          <PopoverTrigger asChild ref={triggerRef}>
            <Button
              variant="ghost"
              size="icon"
              role="combobox"
              className={cn(`hover:bg-transparent ${!inlineTags ? 'ml-auto' : ''}`)}
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-chevron-down h-4 w-4 shrink-0 opacity-50"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent
          side="bottom"
          align="start"
          className={cn(`p-0 relative`)}
          style={{
            top: `${popooverContentTop}px`,
            marginLeft: `calc(-${popoverWidth}px + 36px)`,
            width: `${popoverWidth}px`,
          }}
        >
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions" className={cn('overflow-y-auto')}>
              {autocompleteOptions.map((option) => (
                <CommandItem key={option.id} className="cursor-pointer">
                  <div className="w-full flex items-center gap-2" onClick={() => toggleTag(option)}>
                    {option.text}
                    {tags.some((tag) => tag.text === option.text) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  );
};
