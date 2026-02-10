'use client'

import { useState } from 'react'
import { Menu, X, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/actions/auth'

interface MobileNavProps {
  email: string
}

export function MobileNav({ email }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Menü bezárása' : 'Menü megnyitása'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 right-0 left-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-gray-700">
              <User className="h-4 w-4" />
              <span className="font-medium truncate">{email}</span>
            </div>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Kijelentkezés
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
