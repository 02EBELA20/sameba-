export type Commandment = {
  number: string;
  text: string;
};

export const COMMANDMENTS: Commandment[] = [
  { 
    number: "I", 
    text: "მე ვარ უფალი ღმერთი შენი, და არა იყვნენ შენდა ღმერთნი უცხონი, ჩემსა გარეშე." 
  },
  { 
    number: "II", 
    text: "არა ჰქმნე თავისა შენისა კერპი, არცა ყოვლადვე მსგავსი, რაოდენი არს ცათა შინა ზე, და რაოდენი არს ქვეყანასა ზედა ქვე, და რაოდენი არს წყალთა შინა ქვეშე ქვეყანისა: არა თაყვანი-სცე მათ, არცა მსახურებდე მათ.." 
  },
  { 
    number: "III", 
    text: "ნარა მოიღო სახელი უფლისა ღვთისა შენისა ამაოსა ზედა." 
  },
  { 
    number: "IV", 
    text: "მოიხსენე დღე იგი შაბათი და წმიდა-ჰყავ იგი: ექვს დღე იქმოდე, და ჰქმნე მათ შინა ყოველივე საქმე შენი, ხოლო დღე იგი მეშვიდე შაბათი არს უფლისა ღვთისა შენისა." 
  },
  { 
    number: "V", 
    text: "პატივ-ეც მამასა შენსა და დედასა შენსა, რათა კეთილი გეყოს შენ და დღეგრძელ იყო ქვეყანასა ზედა." 
  },
  { 
    number: "VI", 
    text: "არა კაც-ჰკლა." 
  },
  { 
    number: "VII", 
    text: "არ იმრუშო. " 
  },
  { 
    number: "VIII", 
    text: "არ იპარო" 
  },
  { 
    number: "IX", 
    text: "არა ცილი-სწამო მოყვასსა შენსა წამებითა ცრუითა." 
  },
  { 
    number: "X", 
    text: "არა გული გითქმიდეს ცოლისათვის მოყვასისა შენისა, არა გული გითქმიდეს სახლისათვის მოყვასისა შენისა, არცა ყანისა მისისა, არცა კარაულისა მისისა, არცა ყოვლისა საცხოვარისა მისისა, არცა ყოვლისა მისთვის, რაიცა იყვეს მოყვასისა შენისა." 
  }
];

export function getCommandmentByNumber(number: string): Commandment | undefined {
  return COMMANDMENTS.find(commandment => commandment.number === number);
}

export function getAllCommandments(): Commandment[] {
  return COMMANDMENTS;
}
