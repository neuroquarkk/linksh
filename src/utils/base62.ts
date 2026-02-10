export class Base62 {
    private static ALPHABET =
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private static BASE = this.ALPHABET.length;

    public static encode(num: number): string {
        let s = '';
        if (num === 0) return this.ALPHABET[0]!;
        while (num > 0) {
            s = this.ALPHABET[num % this.BASE] + s;
            num = Math.floor(num / this.BASE);
        }
        return s;
    }

    public static decode(str: string): number {
        let num = 0;
        for (let i = 0; i < str.length; i++) {
            num = num * this.BASE + this.ALPHABET.indexOf(str[i]!);
        }
        return num;
    }
}
