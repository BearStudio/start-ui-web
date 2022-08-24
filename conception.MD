# Conception.MD 
## _Traitement de l'issue 82_
#### _"Add documentation for custom hooks"_
The purpose of this issue is to propose a storybook documentation for the following customs hooks:

- useRtL

## My Job

I'm gonna create a file "docs.stories.tsx" such as we have :  
src/hooks/  
├── docs.stories.tsx  
└── useRtl.ts  

Then I have to figure out what this hook does:  
This hook is a way to identify RTL (Right to Left) setups which can have either value 'rtl' or value 'ltr'.  
Thank's to that, we can change the behavior of some component like the hamburger menu for example.  
The hook return the direction so components will be computed based on the direction.

I think we should present the use of useRtl according to whether the value is rtl or ltr.  

I also think it might be necessary to present the hamburger menu after the useRtl has returned rtl or ltr.
I would draw inspiration from the architecture of the doc that is already present in the project to write mine.  
For exemple, in the file [docs.stories.tsx](https://github.com/BearStudio/start-ui-web/blob/master/src/components/ActionsButton/docs.stories.tsx).  
