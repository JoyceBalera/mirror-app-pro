import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationResult {
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "São Paulo, SP, Brasil",
  disabled = false,
  className,
  error = false,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync inputValue with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=5&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'HumanDesignCalculator/1.0 (contact@example.com)',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar localizações');
      }
      
      const data = await response.json();
      
      const results: LocationResult[] = data.map((item: any) => {
        const address = item.address || {};
        return {
          displayName: item.display_name,
          city: address.city || address.town || address.village || address.municipality,
          state: address.state,
          country: address.country
        };
      });
      
      setSuggestions(results);
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    
    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 400);
    
    if (!open && newValue.length >= 3) {
      setOpen(true);
    }
  };

  const handleSelect = (location: LocationResult) => {
    // Build a clean location string
    const parts = [location.city, location.state, location.country].filter(Boolean);
    const cleanValue = parts.length > 0 ? parts.join(', ') : location.displayName;
    
    setInputValue(cleanValue);
    onChange(cleanValue);
    setSuggestions([]);
    setOpen(false);
  };

  const formatLocationLabel = (location: LocationResult): string => {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : location.displayName;
  };

  return (
    <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pr-10",
              error && "border-destructive",
              className
            )}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            onBlur={() => {
              // Delay closing to allow click on suggestions
              setTimeout(() => setOpen(false), 200);
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0 bg-popover border shadow-md z-50" 
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>
            <CommandGroup>
              {suggestions.map((location, index) => (
                <CommandItem
                  key={index}
                  value={location.displayName}
                  onSelect={() => handleSelect(location)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{formatLocationLabel(location)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
