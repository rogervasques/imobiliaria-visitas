Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\roger.berchembrock\.gemini\antigravity-ide\brain\fcd1a2d1-1b06-49aa-ba77-7146a42266c1\.user_uploaded\media_1788538409635.png'
$srcBmp = [System.Drawing.Bitmap]::new($sourcePath)

function Resize-SquareImage($bmp, $targetSize) {
    $newBmp = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    $srcRatio = $bmp.Width / $bmp.Height
    if ($srcRatio -ge 1) {
        $w = $targetSize
        $h = [int]($targetSize / $srcRatio)
        $x = 0
        $y = [int](($targetSize - $h) / 2)
    } else {
        $h = $targetSize
        $w = [int]($targetSize * $srcRatio)
        $x = [int](($targetSize - $w) / 2)
        $y = 0
    }
    $g.DrawImage($bmp, $x, $y, $w, $h)
    $g.Dispose()
    return $newBmp
}

# 1. 512x512
$bmp512 = Resize-SquareImage $srcBmp 512
$bmp512.Save('c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\public\icon-512.png', [System.Drawing.Imaging.ImageFormat]::Png)

# 2. 192x192
$bmp192 = Resize-SquareImage $srcBmp 192
$bmp192.Save('c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\public\icon-192.png', [System.Drawing.Imaging.ImageFormat]::Png)

# 3. 180x180 (Apple Touch Icon)
$bmp180 = Resize-SquareImage $srcBmp 180
$bmp180.Save('c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\public\icon-180.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Save('c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\public\apple-touch-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)

# 4. 48x48 icon.png for Next.js App Router
$bmp48 = Resize-SquareImage $srcBmp 48
$bmp48.Save('c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\src\app\icon.png', [System.Drawing.Imaging.ImageFormat]::Png)

# 5. 32x32 Favicon ICO (Clean Transparent Icon)
$bmp32 = Resize-SquareImage $srcBmp 32
$icon32 = [System.Drawing.Icon]::FromHandle($bmp32.GetHicon())

if (Test-Path 'c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\src\app\favicon.ico') {
    Remove-Item 'c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\src\app\favicon.ico' -Force
}
$fs1 = [System.IO.File]::OpenWrite('c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\src\app\favicon.ico')
$icon32.Save($fs1)
$fs1.Close()

if (Test-Path 'c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\public\favicon.ico') {
    Remove-Item 'c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\public\favicon.ico' -Force
}
$fs2 = [System.IO.File]::OpenWrite('c:\Users\roger.berchembrock\.gemini\antigravity-ide\scratch\imobiliaria-visitas\public\favicon.ico')
$icon32.Save($fs2)
$fs2.Close()

Write-Host "ALL ICONS GENERATED SUCCESSFULLY!"
